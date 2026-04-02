import { useMemo, useState } from 'react';
import { Button, Card, List, Popconfirm, Tag } from 'antd';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/PageHeader';
import { ScheduleTimeline } from '@/components/schedule/ScheduleTimeline';
import { BlockEditorModal } from '@/components/schedule/BlockEditorModal';
import { useAppStore } from '@/store/app-store';
import { useTransportStore } from '@/store/transport-store';
import { ScheduleBlock } from '@/types/app';
import { formatClock } from '@/utils/time';

export function SchedulePage() {
  const { data, updateScheduleBlocks, appendLog } = useAppStore();
  const { forceBlock } = useTransportStore();
  const { t } = useI18n();
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock>();
  const [open, setOpen] = useState(false);

  const sortedBlocks = useMemo(
    () =>
      [...(data?.scheduleBlocks || [])].sort(
        (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
      ),
    [data?.scheduleBlocks]
  );

  if (!data) return null;

  async function saveBlock(block: ScheduleBlock) {
    const normalized: ScheduleBlock = {
      ...block,
      start: dayjs(block.start).toISOString(),
      end: dayjs(block.end).toISOString(),
      id: block.id || uuid()
    };
    const exists = data.scheduleBlocks.some((item) => item.id === normalized.id);
    const nextBlocks = exists
      ? data.scheduleBlocks.map((item) => (item.id === normalized.id ? normalized : item))
      : [...data.scheduleBlocks, normalized];
    await updateScheduleBlocks(nextBlocks);
    await appendLog('schedule', exists ? `已更新节目块：${normalized.name}` : `已创建节目块：${normalized.name}`);
    setOpen(false);
    setEditingBlock(undefined);
  }

  async function handleInlineChange(block: ScheduleBlock) {
    const nextBlocks = data.scheduleBlocks.map((item) => (item.id === block.id ? block : item));
    await updateScheduleBlocks(nextBlocks);
  }

  return (
    <div className="page-wrap">
      <PageHeader
        eyebrow="Calendar Scheduling"
        title={t('page.schedule.title')}
        description={t('page.schedule.desc')}
        extra={
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setEditingBlock(undefined);
              setOpen(true);
            }}
          >
            {t('button.newBlock')}
          </Button>
        }
      />

      <div className="two-col-layout">
        <Card className="soft-panel">
          <ScheduleTimeline
            blocks={data.scheduleBlocks}
            onCreate={(dateIso) => {
              setEditingBlock({
                id: uuid(),
                name: '新节目块',
                start: dayjs(dateIso).hour(10).minute(0).toISOString(),
                end: dayjs(dateIso).hour(11).minute(0).toISOString(),
                enabled: true,
                priority: 1,
                color: '#2f7fff',
                repeat: 'none',
                repeatDays: [],
                sourceMode: 'category',
                playlistTrackIds: [],
                sourceCategory: 'Music',
                sourceTag: '',
                fillerCategory: 'Filler',
                exceptionDates: [],
                rule: {
                  playbackMode: 'sequential',
                  avoidRepeatCount: 3,
                  preferUnplayed: true,
                  category: 'Music'
                }
              });
              setOpen(true);
            }}
            onEdit={(block) => {
              setEditingBlock(block);
              setOpen(true);
            }}
            onChange={handleInlineChange}
          />
        </Card>

        <Card className="soft-panel side-panel">
          <div className="section-title">{t('label.programList')}</div>
          <List
            dataSource={sortedBlocks}
            renderItem={(block) => (
              <List.Item
                actions={[
                  <Button type="link" key="edit" onClick={() => {
                    setEditingBlock(block);
                    setOpen(true);
                  }}>
                    {t('button.edit')}
                  </Button>,
                  <Button type="link" key="force" onClick={() => forceBlock(block)}>
                    {t('button.force')}
                  </Button>,
                  <Button
                    type="link"
                    key="copy"
                    onClick={async () => {
                      const start = dayjs(block.start).add(1, 'day');
                      const end = dayjs(block.end).add(1, 'day');
                      await saveBlock({ ...block, id: uuid(), start: start.toISOString(), end: end.toISOString() });
                    }}
                  >
                    {t('button.copyTomorrow')}
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="删除这个节目块？"
                    onConfirm={async () => {
                      const next = data.scheduleBlocks.filter((item) => item.id !== block.id);
                      await updateScheduleBlocks(next);
                      await appendLog('schedule', `已删除节目块：${block.name}`);
                    }}
                  >
                    <Button type="link" danger>
                      {t('button.delete')}
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div className="list-row">
                  <div className="color-dot" style={{ background: block.color }} />
                  <div className="list-main">
                    <div>{block.name}</div>
                    <small>
                      {formatClock(block.start)} - {formatClock(block.end)}
                    </small>
                  </div>
                  <Tag>{t(`label.repeat.${block.repeat}`)}</Tag>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <BlockEditorModal
        open={open}
        initialBlock={editingBlock}
        library={data.library}
        onCancel={() => {
          setOpen(false);
          setEditingBlock(undefined);
        }}
        onSave={saveBlock}
      />
    </div>
  );
}
