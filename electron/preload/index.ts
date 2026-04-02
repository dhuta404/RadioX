import { contextBridge, ipcRenderer } from 'electron';
import { AppData, LogEntry } from '../main/types';

contextBridge.exposeInMainWorld('radioAPI', {
  loadAppData: (): Promise<AppData> => ipcRenderer.invoke('app:load'),
  saveAppData: (data: AppData): Promise<AppData> => ipcRenderer.invoke('app:save', data),
  importFiles: () => ipcRenderer.invoke('library:import-files'),
  importFolder: () => ipcRenderer.invoke('library:import-folder'),
  appendLog: (log: Omit<LogEntry, 'id' | 'time'>) => ipcRenderer.invoke('app:append-log', log),
  getUserDataPath: (): Promise<string> => ipcRenderer.invoke('app:get-user-data-path'),
  toFileUrl: (filePath: string): Promise<string> => ipcRenderer.invoke('app:to-file-url', filePath)
});
