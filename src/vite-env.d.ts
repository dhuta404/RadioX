/// <reference types="vite/client" />

import type { AppData, LogEntry } from '@/types/app';

declare global {
  interface Window {
    radioAPI: {
      loadAppData: () => Promise<AppData>;
      saveAppData: (data: AppData) => Promise<AppData>;
      importFiles: () => Promise<unknown>;
      importFolder: () => Promise<unknown>;
      appendLog: (log: Omit<LogEntry, 'id' | 'time'>) => Promise<LogEntry>;
      getUserDataPath: () => Promise<string>;
      toFileUrl: (filePath: string) => Promise<string>;
    };
  }
}

export {};
