import dayjs from 'dayjs';
import { AppData, LibraryItem, ScheduleBlock } from '@/types/app';
import { estimateRemainingInBlock, pickTracksForBlock } from '@/utils/schedule';

export type SelectionResult = {
  track?: LibraryItem;
  reason: string;
  sourceBlock?: ScheduleBlock;
};

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function selectNextTrack(
  data: AppData,
  activeBlock: ScheduleBlock | undefined,
  recentTrackIds: string[]
): SelectionResult {
  const now = dayjs();
  const blockPool = pickTracksForBlock(data, activeBlock, recentTrackIds);
  const remainingSec = estimateRemainingInBlock(activeBlock, now);
  const skipThreshold = activeBlock?.rule.skipIfRemainingLessThanSec || 0;

  let pool = blockPool;
  if (activeBlock && skipThreshold > 0 && remainingSec <= skipThreshold) {
    pool = pool.filter((item) => item.durationSec <= remainingSec);
  }

  if (pool.length > 0) {
    const ordered =
      activeBlock?.rule.playbackMode === 'random' || activeBlock?.sourceMode === 'random'
        ? shuffled(pool)
        : pool;
    return {
      track: ordered[0],
      reason: activeBlock ? 'block' : 'filler',
      sourceBlock: activeBlock
    };
  }

  const fillerPool = pickTracksForBlock(data, undefined, recentTrackIds);
  if (fillerPool.length > 0) {
    return {
      track: shuffled(fillerPool)[0],
      reason: 'filler',
      sourceBlock: activeBlock
    };
  }

  const fallback = data.globalRules.fallbackTrackIds
    .map((id) => data.library.find((item) => item.id === id))
    .filter(Boolean) as LibraryItem[];

  if (fallback.length > 0) {
    return {
      track: fallback[0],
      reason: 'fallback',
      sourceBlock: activeBlock
    };
  }

  return { reason: 'empty', sourceBlock: activeBlock };
}
