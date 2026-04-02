import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { createDefaultData } from './default-data';
import { AppData, LogEntry } from './types';

export class DataStore {
  private dataPath: string;
  private data: AppData;

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'radioflow-data.json');
    this.data = this.load();
  }

  private load(): AppData {
    if (!fs.existsSync(this.dataPath)) {
      const seed = createDefaultData();
      fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(seed, null, 2), 'utf-8');
      return seed;
    }

    try {
      const content = fs.readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(content) as AppData;
    } catch {
      return createDefaultData();
    }
  }

  getData(): AppData {
    return this.data;
  }

  save(nextData: AppData): AppData {
    this.data = nextData;
    fs.writeFileSync(this.dataPath, JSON.stringify(nextData, null, 2), 'utf-8');
    return this.data;
  }

  patch<T extends keyof AppData>(key: T, value: AppData[T]) {
    this.data = { ...this.data, [key]: value };
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    return this.data;
  }

  appendLog(entry: LogEntry) {
    this.data.logs = [entry, ...this.data.logs].slice(0, 500);
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }
}
