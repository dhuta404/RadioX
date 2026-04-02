export type LibraryItem = {
  id: string;
  fileName: string;
  title: string;
  durationSec: number;
  path: string;
  category: string;
  tags: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  artist?: string;
  album?: string;
};

export type BlockSourceMode = 'playlist' | 'category' | 'random' | 'filler';
export type PlaybackMode = 'sequential' | 'random';

export type ScheduleRule = {
  playbackMode: PlaybackMode;
  avoidRepeatCount: number;
  preferUnplayed: boolean;
  category?: string;
  tag?: string;
  maxDurationMinutes?: number;
  skipIfRemainingLessThanSec?: number;
  introTrackId?: string;
  outroTrackId?: string;
};

export type ScheduleBlock = {
  id: string;
  name: string;
  start: string;
  end: string;
  enabled: boolean;
  priority: number;
  color: string;
  repeat: 'none' | 'daily' | 'weekly';
  repeatDays: number[];
  sourceMode: BlockSourceMode;
  playlistTrackIds: string[];
  sourceCategory?: string;
  sourceTag?: string;
  fillerCategory?: string;
  exceptionDates: string[];
  rule: ScheduleRule;
};

export type GlobalRules = {
  defaultFillerCategory: string;
  fallbackTrackIds: string[];
  crossfadeSec: number;
  transitionFadeSec: number;
  silenceProtection: boolean;
  skipBrokenFiles: boolean;
  defaultVolume: number;
};

export type PlaybackState = {
  automationEnabled: boolean;
  activeBlockId?: string;
  currentTrackId?: string;
  currentTrackStartedAt?: string;
  currentTrackDurationSec?: number;
  queue: string[];
  playedTrackIds: string[];
  paused: boolean;
};

export type LogEntry = {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  scope: string;
  message: string;
};

export type AppSettings = {
  outputDeviceId?: string;
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  logsEnabled: boolean;
  language: 'zh-CN' | 'en-US';
};

export type AppData = {
  library: LibraryItem[];
  scheduleBlocks: ScheduleBlock[];
  globalRules: GlobalRules;
  playback: PlaybackState;
  settings: AppSettings;
  logs: LogEntry[];
};

export type EngineSnapshot = {
  activeBlock?: ScheduleBlock;
  currentTrack?: LibraryItem;
  nextTrack?: LibraryItem;
  remainingSec: number;
  now: string;
  status: 'idle' | 'playing' | 'paused';
};
