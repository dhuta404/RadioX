import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import dayjs from 'dayjs';
import { Button, Segmented } from 'antd';
import { useI18n } from '@/i18n';
import { ScheduleBlock } from '@/types/app';
import { formatClock, minutesToIso } from '@/utils/time';
import { getBlocksForDate } from '@/utils/schedule';

type Props = {
  blocks: ScheduleBlock[];
  onCreate: (dateIso: string) => void;
  onEdit: (block: ScheduleBlock) => void;
  onChange: (block: ScheduleBlock) => void;
};

const HOUR_HEIGHT = 64;

export function ScheduleTimeline({ blocks, onCreate, onEdit, onChange }: Props) {
  const { t } = useI18n();
  const [view, setView] = useState<'day' | 'week'>('day');
  const [anchorDate, setAnchorDate] = useState(dayjs());
  const dragState = useRef<{
    block: ScheduleBlock;
    mode: 'move' | 'resize';
    startY: number;
    originStartMinutes: number;
    originEndMinutes: number;
  } | null>(null);

  const days = useMemo(
    () => (view === 'day' ? [anchorDate] : Array.from({ length: 7 }, (_, index) => anchorDate.startOf('week').add(index, 'day'))),
    [anchorDate, view]
  );

  function blockToMinutes(block: ScheduleBlock) {
    const start = dayjs(block.start);
    const end = dayjs(block.end);
    return {
      startMinutes: start.hour() * 60 + start.minute(),
      endMinutes: end.hour() * 60 + end.minute()
    };
  }

  function attachDrag(block: ScheduleBlock, mode: 'move' | 'resize', event: ReactPointerEvent) {
    const { startMinutes, endMinutes } = blockToMinutes(block);
    dragState.current = {
      block,
      mode,
      startY: event.clientY,
      originStartMinutes: startMinutes,
      originEndMinutes: endMinutes
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent) {
    if (!dragState.current) return;
    const deltaMinutes = Math.round((event.clientY - dragState.current.startY) / (HOUR_HEIGHT / 60) / 15) * 15;
    const day = dayjs(dragState.current.block.start);
    const nextStart =
      dragState.current.mode === 'move'
        ? dragState.current.originStartMinutes + deltaMinutes
        : dragState.current.originStartMinutes;
    const nextEnd =
      dragState.current.mode === 'resize'
        ? dragState.current.originEndMinutes + deltaMinutes
        : dragState.current.originEndMinutes + deltaMinutes;

    if (nextEnd - nextStart < 15) return;
    onChange({
      ...dragState.current.block,
      start: minutesToIso(day.toISOString(), Math.max(0, nextStart)),
      end: minutesToIso(day.toISOString(), Math.min(24 * 60, nextEnd))
    });
  }

  function stopDrag() {
    dragState.current = null;
  }

  return (
    <div className="schedule-wrap">
      <div className="schedule-toolbar">
        <Segmented
          options={[
            { label: t('timeline.day'), value: 'day' },
            { label: t('timeline.week'), value: 'week' }
          ]}
          value={view}
          onChange={(value) => setView(value as 'day' | 'week')}
        />
        <div className="toolbar-right">
          <Button onClick={() => setAnchorDate(anchorDate.subtract(view === 'day' ? 1 : 7, 'day'))}>{t('button.previous')}</Button>
          <Button onClick={() => setAnchorDate(dayjs())}>{t('button.today')}</Button>
          <Button onClick={() => setAnchorDate(anchorDate.add(view === 'day' ? 1 : 7, 'day'))}>{t('button.next')}</Button>
        </div>
      </div>

      <div className="timeline-grid" onPointerMove={handlePointerMove} onPointerUp={stopDrag}>
        <div className="hours-col">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="hour-cell">
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="days-grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day) => {
            const dayBlocks = getBlocksForDate(blocks, day);
            return (
              <div key={day.toISOString()} className="day-column">
                <div className="day-header">
                  <strong>{day.format('MM/DD')}</strong>
                  <span>{day.format('ddd')}</span>
                  <Button type="link" onClick={() => onCreate(day.toISOString())}>
                    {t('timeline.new')}
                  </Button>
                </div>
                <div className="day-body">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="day-hour-line" />
                  ))}

                  {dayBlocks.map((block) => {
                    const { startMinutes, endMinutes } = blockToMinutes(block);
                    const height = Math.max(32, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT);
                    const top = (startMinutes / 60) * HOUR_HEIGHT;
                    return (
                      <div
                        key={block.id}
                        className="schedule-block"
                        style={{ top, height, background: block.color }}
                        onDoubleClick={() => onEdit(block)}
                        onPointerDown={(event) => attachDrag(block, 'move', event)}
                      >
                        <div className="schedule-block-title">{block.name}</div>
                        <div className="schedule-block-time">
                          {formatClock(block.start)} - {formatClock(block.end)}
                        </div>
                        <div className="schedule-block-rule">
                          {t(`label.sourceMode.${block.sourceMode}`)} / {t(`label.playbackMode.${block.rule.playbackMode}`)}
                        </div>
                        <div
                          className="resize-handle"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            attachDrag(block, 'resize', event);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
