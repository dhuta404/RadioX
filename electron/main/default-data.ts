import dayjs from 'dayjs';
import { AppData } from './types';

const now = dayjs();
const today = now.startOf('day');

export function createDefaultData(): AppData {
  return {
    library: [],
    scheduleBlocks: [
      {
        id: 'block-morning',
        name: '晨间音乐带',
        start: today.hour(7).minute(0).second(0).toISOString(),
        end: today.hour(9).minute(0).second(0).toISOString(),
        enabled: true,
        priority: 1,
        color: '#2f7fff',
        repeat: 'daily',
        repeatDays: [],
        sourceMode: 'category',
        playlistTrackIds: [],
        sourceCategory: 'Music',
        sourceTag: '',
        fillerCategory: 'Filler',
        exceptionDates: [],
        rule: {
          playbackMode: 'random',
          avoidRepeatCount: 5,
          preferUnplayed: true,
          category: 'Music',
          skipIfRemainingLessThanSec: 90
        }
      },
      {
        id: 'block-news',
        name: '整点资讯',
        start: today.hour(9).minute(0).second(0).toISOString(),
        end: today.hour(9).minute(30).second(0).toISOString(),
        enabled: true,
        priority: 2,
        color: '#19c37d',
        repeat: 'daily',
        repeatDays: [],
        sourceMode: 'category',
        playlistTrackIds: [],
        sourceCategory: 'News',
        sourceTag: '',
        fillerCategory: 'Filler',
        exceptionDates: [],
        rule: {
          playbackMode: 'sequential',
          avoidRepeatCount: 2,
          preferUnplayed: true,
          category: 'News',
          maxDurationMinutes: 30,
          skipIfRemainingLessThanSec: 45
        }
      },
      {
        id: 'block-drive',
        name: '晚高峰陪伴',
        start: today.hour(18).minute(0).second(0).toISOString(),
        end: today.hour(20).minute(0).second(0).toISOString(),
        enabled: true,
        priority: 1,
        color: '#ff7a45',
        repeat: 'daily',
        repeatDays: [],
        sourceMode: 'random',
        playlistTrackIds: [],
        sourceCategory: 'Music',
        sourceTag: 'Drive',
        fillerCategory: 'Filler',
        exceptionDates: [],
        rule: {
          playbackMode: 'random',
          avoidRepeatCount: 8,
          preferUnplayed: false,
          category: 'Music',
          tag: 'Drive',
          skipIfRemainingLessThanSec: 120
        }
      }
    ],
    globalRules: {
      defaultFillerCategory: 'Filler',
      fallbackTrackIds: [],
      crossfadeSec: 4,
      transitionFadeSec: 2,
      silenceProtection: true,
      skipBrokenFiles: true,
      defaultVolume: 0.85
    },
    playback: {
      automationEnabled: false,
      queue: [],
      playedTrackIds: [],
      paused: false
    },
    settings: {
      launchOnStartup: false,
      minimizeToTray: true,
      logsEnabled: true,
      language: 'zh-CN'
    },
    logs: [
      {
        id: 'log-initial',
        time: new Date().toISOString(),
        level: 'info',
        scope: 'system',
        message: '应用已初始化，示例排期已创建。'
      }
    ]
  };
}
