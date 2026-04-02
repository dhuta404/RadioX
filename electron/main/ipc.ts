import { ipcMain, dialog, app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFile } from 'music-metadata';
import { v4 as uuid } from 'uuid';
import { DataStore } from './store';
import { AppData, LibraryItem, LogEntry } from './types';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac']);

async function fileToLibraryItem(filePath: string): Promise<LibraryItem | null> {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (!AUDIO_EXTENSIONS.has(ext)) {
    return null;
  }

  let metadataTitle = path.basename(filePath, ext);
  let durationSec = 0;
  let artist = '';
  let album = '';

  try {
    const metadata = await parseFile(filePath);
    metadataTitle = metadata.common.title || metadataTitle;
    durationSec = Math.round(metadata.format.duration || 0);
    artist = metadata.common.artist || '';
    album = metadata.common.album || '';
  } catch {
    // Metadata parsing can fail on some files; we still keep the file.
  }

  return {
    id: uuid(),
    fileName: path.basename(filePath),
    title: metadataTitle,
    durationSec,
    path: filePath,
    category: 'Unsorted',
    tags: [],
    enabled: true,
    createdAt: stat.birthtime.toISOString(),
    updatedAt: stat.mtime.toISOString(),
    artist,
    album
  };
}

async function collectAudioFiles(folderPath: string): Promise<string[]> {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  const collected: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      collected.push(...(await collectAudioFiles(fullPath)));
    } else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      collected.push(fullPath);
    }
  }

  return collected;
}

function buildLog(scope: string, message: string, level: LogEntry['level'] = 'info'): LogEntry {
  return {
    id: uuid(),
    time: new Date().toISOString(),
    level,
    scope,
    message
  };
}

export function registerIpc(store: DataStore) {
  ipcMain.handle('app:load', () => store.getData());

  ipcMain.handle('app:save', async (_, nextData: AppData) => {
    const saved = store.save(nextData);
    return saved;
  });

  ipcMain.handle('app:append-log', async (_, log: Omit<LogEntry, 'id' | 'time'>) => {
    const entry = buildLog(log.scope, log.message, log.level);
    store.appendLog(entry);
    return entry;
  });

  ipcMain.handle('library:import-files', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'aac', 'flac'] }]
    });

    if (result.canceled) {
      return [];
    }

    const items = (await Promise.all(result.filePaths.map(fileToLibraryItem))).filter(Boolean) as LibraryItem[];
    const existing = new Map(store.getData().library.map((item) => [item.path, item]));
    const merged = [...store.getData().library];

    for (const item of items) {
      if (!existing.has(item.path)) {
        merged.push(item);
      }
    }

    store.patch('library', merged);
    store.appendLog(buildLog('library', `已导入 ${items.length} 个音频文件。`));
    return merged;
  });

  ipcMain.handle('library:import-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    const files = await collectAudioFiles(result.filePaths[0]);
    const items = (await Promise.all(files.map(fileToLibraryItem))).filter(Boolean) as LibraryItem[];
    const existing = new Map(store.getData().library.map((item) => [item.path, item]));
    const merged = [...store.getData().library];

    for (const item of items) {
      if (!existing.has(item.path)) {
        merged.push(item);
      }
    }

    store.patch('library', merged);
    store.appendLog(buildLog('library', `已从文件夹导入 ${items.length} 个音频文件。`));
    return merged;
  });

  ipcMain.handle('app:get-user-data-path', () => app.getPath('userData'));
  ipcMain.handle('app:to-file-url', (_, filePath: string) => pathToFileURL(filePath).href);
}
