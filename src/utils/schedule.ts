import dayjs, { Dayjs } from 'dayjs';
import { AppData, LibraryItem, ScheduleBlock } from '@/types/app';

export function resolveBlockInstance(block: ScheduleBlock, target: Dayjs) {
  const startTemplate = dayjs(block.start);
  const endTemplate = dayjs(block.end);

  const start = target
    .startOf('day')
    .hour(startTemplate.hour())
    .minute(startTemplate.minute())
    .second(0)
    .millisecond(0);

  let end = target
    .startOf('day')
    .hour(endTemplate.hour())
    .minute(endTemplate.minute())
    .second(0)
    .millisecond(0);

  if (end.isBefore(start) || end.isSame(start)) {
    end = end.add(1, 'day');
  }

  return { ...block, start: start.toISOString(), end: end.toISOString() };
}

export function isBlockActiveOnDate(block: ScheduleBlock, target: Dayjs) {
  const dateKey = target.format('YYYY-MM-DD');
  if (!block.enabled || block.exceptionDates.includes(dateKey)) {
    return false;
  }

  if (block.repeat === 'daily') {
    return true;
  }

  if (block.repeat === 'weekly') {
    return block.repeatDays.includes(target.day());
  }

  return dayjs(block.start).format('YYYY-MM-DD') === dateKey;
}

export function getBlocksForDate(blocks: ScheduleBlock[], target: Dayjs) {
  return blocks
    .filter((block) => isBlockActiveOnDate(block, target))
    .map((block) => resolveBlockInstance(block, target))
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
}

export function getCurrentBlock(blocks: ScheduleBlock[], now: Dayjs) {
  const todayBlocks = getBlocksForDate(blocks, now);
  return todayBlocks
    .filter((block) => now.isAfter(dayjs(block.start)) && now.isBefore(dayjs(block.end)))
    .sort((a, b) => b.priority - a.priority)[0];
}

export function getNextBlock(blocks: ScheduleBlock[], now: Dayjs) {
  const nextSevenDays = Array.from({ length: 7 }, (_, index) => now.add(index, 'day'));
  const candidates = nextSevenDays
    .flatMap((date) => getBlocksForDate(blocks, date))
    .filter((block) => dayjs(block.start).isAfter(now))
    .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

  return candidates[0];
}

export function pickTracksForBlock(
  data: AppData,
  block: ScheduleBlock | undefined,
  recentTrackIds: string[]
): LibraryItem[] {
  const library = data.library.filter((item) => item.enabled);
  const source = block?.sourceMode ?? 'filler';
  const rule = block?.rule;
  const excluded = new Set(recentTrackIds.slice(-1 * (rule?.avoidRepeatCount || 0)));

  let pool = library;

  if (source === 'playlist' && block) {
    pool = block.playlistTrackIds
      .map((id) => library.find((item) => item.id === id))
      .filter(Boolean) as LibraryItem[];
  } else if ((source === 'category' || source === 'random') && block) {
    pool = library.filter((item) => {
      const categoryOk = block.sourceCategory ? item.category === block.sourceCategory : true;
      const tagOk = block.sourceTag ? item.tags.includes(block.sourceTag) : true;
      return categoryOk && tagOk;
    });
  } else {
    const fillerCategory = block?.fillerCategory || data.globalRules.defaultFillerCategory;
    pool = library.filter((item) => item.category === fillerCategory);
  }

  if (rule?.category) {
    pool = pool.filter((item) => item.category === rule.category);
  }

  if (rule?.tag) {
    pool = pool.filter((item) => item.tags.includes(rule.tag!));
  }

  if (rule?.maxDurationMinutes) {
    pool = pool.filter((item) => item.durationSec <= rule.maxDurationMinutes! * 60);
  }

  const withoutRecent = pool.filter((item) => !excluded.has(item.id));
  const finalPool = withoutRecent.length > 0 ? withoutRecent : pool;

  if (rule?.preferUnplayed) {
    const unplayed = finalPool.filter((item) => !recentTrackIds.includes(item.id));
    if (unplayed.length > 0) {
      return unplayed;
    }
  }

  return finalPool;
}

export function estimateRemainingInBlock(block: ScheduleBlock | undefined, now: Dayjs) {
  if (!block) {
    return 0;
  }

  return Math.max(0, dayjs(block.end).diff(now, 'second'));
}
