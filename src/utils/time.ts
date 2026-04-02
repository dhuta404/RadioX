import dayjs from 'dayjs';

export function formatDuration(totalSec: number) {
  const safe = Math.max(0, Math.round(totalSec || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatClock(date: string | Date) {
  return dayjs(date).format('HH:mm');
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function minutesToIso(baseDate: string, minutes: number) {
  return dayjs(baseDate).startOf('day').add(minutes, 'minute').toISOString();
}

export function isoDateOnly(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}
