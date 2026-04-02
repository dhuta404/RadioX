import { useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/app-store';
import { useTransportStore } from '@/store/transport-store';
import { selectNextTrack } from '@/services/audio-selector';
import { fadeAudio } from '@/services/fader';
import { getCurrentBlock, getNextBlock } from '@/utils/schedule';
import type { LibraryItem, ScheduleBlock } from '@/types/app';

export function AutomationEngine() {
  const { data, saveData, setEngine, appendLog } = useAppStore();
  const registerControls = useTransportStore((state) => state.registerControls);
  const audioARef = useRef(new Audio());
  const audioBRef = useRef(new Audio());
  const activeDeckRef = useRef<'a' | 'b'>('a');
  const transitionLockRef = useRef(false);
  const currentTrackRef = useRef<LibraryItem | undefined>(undefined);
  const pendingOverrideRef = useRef<ScheduleBlock | undefined>(undefined);

  const currentAudio = useMemo(
    () => () => (activeDeckRef.current === 'a' ? audioARef.current : audioBRef.current),
    []
  );

  const standbyAudio = useMemo(
    () => () => (activeDeckRef.current === 'a' ? audioBRef.current : audioARef.current),
    []
  );

  useEffect(() => {
    registerControls({
      startAutomation: async () => {
        if (!data) return;
        const nextData = {
          ...data,
          playback: {
            ...data.playback,
            automationEnabled: true,
            paused: false
          }
        };
        await saveData(nextData);
        await appendLog('automation', '自动播出已开始。');
      },
      stopAutomation: async () => {
        if (!data) return;
        for (const audio of [audioARef.current, audioBRef.current]) {
          audio.pause();
          audio.src = '';
          audio.currentTime = 0;
        }
        currentTrackRef.current = undefined;
        transitionLockRef.current = false;
        const nextData = {
          ...data,
          playback: {
            ...data.playback,
            automationEnabled: false,
            paused: false,
            currentTrackId: undefined,
            currentTrackStartedAt: undefined,
            currentTrackDurationSec: undefined,
            activeBlockId: undefined
          }
        };
        await saveData(nextData);
        setEngine({ status: 'idle', currentTrack: undefined, remainingSec: 0, nextTrack: undefined });
        await appendLog('automation', '自动播出已停止。');
      },
      togglePause: async () => {
        if (!data) return;
        const audio = currentAudio();
        const paused = !data.playback.paused;
        if (paused) {
          audio.pause();
        } else if (data.playback.automationEnabled) {
          await audio.play().catch(() => undefined);
        }
        await saveData({
          ...data,
          playback: {
            ...data.playback,
            paused
          }
        });
        setEngine({ status: paused ? 'paused' : 'playing' });
        await appendLog('automation', paused ? '播出已暂停。' : '播出已恢复。');
      },
      skipTrack: async () => {
        if (!data?.playback.automationEnabled) return;
        await appendLog('automation', '已手动跳过当前音频。');
        await transitionToNext(true);
      },
      forceBlock: async (block) => {
        pendingOverrideRef.current = block;
        await appendLog('automation', `已手动切换到节目块：${block.name}`);
        await transitionToNext(true);
      }
    });
  }, [appendLog, currentAudio, data, registerControls, saveData, setEngine]);

  async function playSelection(track: LibraryItem, sourceBlock?: ScheduleBlock) {
    if (!data) return;

    const incoming = standbyAudio();
    const outgoing = currentTrackRef.current ? currentAudio() : undefined;
    const targetVolume = data.globalRules.defaultVolume;
    const fadeMs = data.globalRules.crossfadeSec * 1000;
    const fileUrl = await window.radioAPI.toFileUrl(track.path);

    transitionLockRef.current = true;
    incoming.src = fileUrl;
    incoming.volume = 0;

    try {
      // Dual-deck crossfade keeps transitions smooth when tracks or blocks change.
      await incoming.play();
      fadeAudio(incoming, 0, targetVolume, fadeMs);

      if (outgoing && outgoing.src) {
        fadeAudio(outgoing, outgoing.volume || targetVolume, 0, fadeMs, () => {
          outgoing.pause();
          outgoing.currentTime = 0;
        });
      }

      activeDeckRef.current = activeDeckRef.current === 'a' ? 'b' : 'a';
      currentTrackRef.current = track;
      const nextData = {
        ...data,
        playback: {
          ...data.playback,
          activeBlockId: sourceBlock?.id,
          currentTrackId: track.id,
          currentTrackStartedAt: new Date().toISOString(),
          currentTrackDurationSec: track.durationSec,
          playedTrackIds: [...data.playback.playedTrackIds, track.id].slice(-100)
        }
      };
      await saveData(nextData);
      setEngine({
        status: 'playing',
        currentTrack: track,
        activeBlock: sourceBlock,
        remainingSec: track.durationSec
      });
      await appendLog(
        'playback',
        sourceBlock ? `开始播放《${track.title}》，所属节目：${sourceBlock.name}` : `开始播放《${track.title}》`
      );
    } catch {
      await appendLog('playback', `文件播放失败，已跳过：${track.title}`, 'warning');
    } finally {
      window.setTimeout(() => {
        transitionLockRef.current = false;
      }, Math.max(1000, fadeMs));
    }
  }

  async function transitionToNext(force = false) {
    if (!data || transitionLockRef.current) return;
    const now = dayjs();
    const activeBlock = pendingOverrideRef.current || getCurrentBlock(data.scheduleBlocks, now);
    pendingOverrideRef.current = undefined;
    const recent = data.playback.playedTrackIds;
    const selection = selectNextTrack(data, activeBlock, recent);

    if (!selection.track) {
      setEngine({
        activeBlock,
        currentTrack: undefined,
        nextTrack: undefined,
        remainingSec: 0,
        status: force ? 'idle' : data.playback.paused ? 'paused' : 'idle'
      });
      return;
    }

    await playSelection(selection.track, selection.sourceBlock);
    const nextSelection = selectNextTrack(
      {
        ...data,
        playback: {
          ...data.playback,
          playedTrackIds: [...recent, selection.track.id]
        }
      },
      activeBlock,
      [...recent, selection.track.id]
    );
    setEngine({
      nextTrack: nextSelection.track,
      activeBlock,
      remainingSec: selection.track.durationSec
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEngine({ now: new Date().toISOString() });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [setEngine]);

  useEffect(() => {
    if (!data) return;

    const handler = window.setInterval(async () => {
      const now = dayjs();
      const activeBlock = pendingOverrideRef.current || getCurrentBlock(data.scheduleBlocks, now);
      const nextBlock = getNextBlock(data.scheduleBlocks, now);
      const track = currentTrackRef.current;
      const audio = currentAudio();
      const rawRemaining = track ? audio.duration - audio.currentTime : 0;
      const remainingSec = Number.isFinite(rawRemaining) ? Math.max(0, Math.ceil(rawRemaining)) : 0;

      setEngine({
        activeBlock,
        currentTrack: track,
        remainingSec,
        status: data.playback.paused ? 'paused' : track ? 'playing' : 'idle',
        nextTrack: useAppStore.getState().engine.nextTrack,
        now: now.toISOString()
      });

      if (!data.playback.automationEnabled || data.playback.paused) {
        return;
      }

      if (!track) {
        await transitionToNext();
        return;
      }

      if (
        !transitionLockRef.current &&
        remainingSec <= Math.max(1, data.globalRules.crossfadeSec + 1)
      ) {
        // We trigger the next deck slightly before the current track ends
        // so crossfade still works even when files have different loudness.
        await transitionToNext();
      }

      if (nextBlock && activeBlock?.id !== nextBlock.id && remainingSec === 0) {
        await transitionToNext(true);
      }
    }, 1000);

    return () => window.clearInterval(handler);
  }, [currentAudio, data, setEngine]);

  return null;
}
