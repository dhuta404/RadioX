import { create } from 'zustand';
import dayjs from 'dayjs';
import { AppData, EngineSnapshot, LibraryItem, ScheduleBlock } from '@/types/app';

type AppState = {
  data: AppData | null;
  loading: boolean;
  engine: EngineSnapshot;
  selectedPage: 'dashboard' | 'schedule' | 'library' | 'rules' | 'settings';
  setSelectedPage: (page: AppState['selectedPage']) => void;
  setEngine: (engine: Partial<EngineSnapshot>) => void;
  load: () => Promise<void>;
  saveData: (nextData: AppData) => Promise<void>;
  updateLibrary: (library: LibraryItem[]) => Promise<void>;
  updateScheduleBlocks: (scheduleBlocks: ScheduleBlock[]) => Promise<void>;
  appendLog: (scope: string, message: string, level?: 'info' | 'warning' | 'error') => Promise<void>;
};

const defaultEngine: EngineSnapshot = {
  now: dayjs().toISOString(),
  remainingSec: 0,
  status: 'idle'
};

export const useAppStore = create<AppState>((set, get) => ({
  data: null,
  loading: true,
  engine: defaultEngine,
  selectedPage: 'dashboard',
  setSelectedPage: (selectedPage) => set({ selectedPage }),
  setEngine: (patch) => set((state) => ({ engine: { ...state.engine, ...patch } })),
  load: async () => {
    const data = await window.radioAPI.loadAppData();
    set({ data, loading: false });
  },
  saveData: async (nextData) => {
    const data = await window.radioAPI.saveAppData(nextData);
    set({ data });
  },
  updateLibrary: async (library) => {
    const current = get().data;
    if (!current) return;
    const data = await window.radioAPI.saveAppData({ ...current, library });
    set({ data });
  },
  updateScheduleBlocks: async (scheduleBlocks) => {
    const current = get().data;
    if (!current) return;
    const data = await window.radioAPI.saveAppData({ ...current, scheduleBlocks });
    set({ data });
  },
  appendLog: async (scope, message, level = 'info') => {
    const current = get().data;
    if (!current) return;
    const newLog = await window.radioAPI.appendLog({ scope, message, level });
    set({
      data: {
        ...current,
        logs: [newLog, ...current.logs].slice(0, 500)
      }
    });
  }
}));
