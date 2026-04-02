import { useMemo, useRef, useState } from 'react';
import { Button, Card, Input, Popconfirm, Select, Space, Switch, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store/app-store';
import { LibraryItem } from '@/types/app';
import { formatDuration } from '@/utils/time';

export function LibraryPage() {
  const { data, updateLibrary, appendLog } = useAppStore();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>();
  const [msgApi, contextHolder] = message.useMessage();
  const previewAudioRef = useRef(new Audio());

  if (!data) return null;

  const categories = Array.from(new Set(data.library.map((item) => item.category))).filter(Boolean);
  const filtered = useMemo(
    () =>
      data.library.filter((item) => {
        const matchesKeyword = item.title.toLowerCase().includes(keyword.toLowerCase());
        const matchesCategory = category ? item.category === category : true;
        return matchesKeyword && matchesCategory;
      }),
    [category, data.library, keyword]
  );

  const columns: ColumnsType<LibraryItem> = [
    { title: t('table.title'), dataIndex: 'title' },
    {
      title: t('table.editTitle'),
      dataIndex: 'titleEdit',
      render: (_value, record) => (
        <Input
          value={record.title}
          onChange={async (event) => {
            const next = data.library.map((item) =>
              item.id === record.id ? { ...item, title: event.target.value } : item
            );
            await updateLibrary(next);
          }}
        />
      )
    },
    { title: t('table.fileName'), dataIndex: 'fileName' },
    {
      title: t('table.duration'),
      dataIndex: 'durationSec',
      render: (value) => formatDuration(value)
    },
    {
      title: t('table.category'),
      dataIndex: 'category',
      render: (value, record) => (
        <Input
          value={value}
          onChange={async (event) => {
            const next = data.library.map((item) =>
              item.id === record.id ? { ...item, category: event.target.value } : item
            );
            await updateLibrary(next);
          }}
        />
      )
    },
    {
      title: t('table.tags'),
      dataIndex: 'tags',
      render: (value: string[], record) => (
        <Input
          value={value.join(', ')}
          onChange={async (event) => {
            const next = data.library.map((item) =>
              item.id === record.id
                ? {
                    ...item,
                    tags: event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  }
                : item
            );
            await updateLibrary(next);
          }}
        />
      )
    },
    {
      title: t('table.enabled'),
      dataIndex: 'enabled',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={async (checked) => {
            const next = data.library.map((item) => (item.id === record.id ? { ...item, enabled: checked } : item));
            await updateLibrary(next);
          }}
        />
      )
    },
    {
      title: t('table.actions'),
      dataIndex: 'actions',
      render: (_value, record) => (
        <Space>
          <Button
            size="small"
            onClick={async () => {
              const url = await window.radioAPI.toFileUrl(record.path);
              previewAudioRef.current.src = url;
              await previewAudioRef.current.play();
            }}
          >
              {t('button.preview')}
          </Button>
          <Button
            size="small"
            onClick={() => {
              previewAudioRef.current.pause();
              previewAudioRef.current.currentTime = 0;
            }}
          >
            {t('button.stopPreview')}
          </Button>
          <Popconfirm
            title="删除这个音频条目？"
            onConfirm={async () => {
              const next = data.library.filter((item) => item.id !== record.id);
              await updateLibrary(next);
              await appendLog('library', `已删除音频：${record.title}`);
            }}
          >
            <Button danger size="small">
              {t('button.delete')}
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  async function importFiles() {
    const result = (await window.radioAPI.importFiles()) as LibraryItem[];
    await updateLibrary(result);
    await appendLog('library', `用户导入了 ${result.length} 个音频文件。`);
    msgApi.success(`音频库现在共有 ${result.length} 个文件`);
  }

  async function importFolder() {
    const result = (await window.radioAPI.importFolder()) as LibraryItem[];
    await updateLibrary(result);
    await appendLog('library', `用户从文件夹导入了 ${result.length} 个音频文件。`);
    msgApi.success(`音频库现在共有 ${result.length} 个文件`);
  }

  return (
    <div className="page-wrap">
      {contextHolder}
      <PageHeader
        eyebrow="Audio Library"
        title={t('page.library.title')}
        description={t('page.library.desc')}
        extra={
          <Space>
            <Button onClick={importFiles}>{t('button.importFiles')}</Button>
            <Button type="primary" onClick={importFolder}>
              {t('button.importFolder')}
            </Button>
          </Space>
        }
      />

      <Card className="soft-panel">
        <div className="toolbar-row">
          <Input
            placeholder={t('label.searchTitle')}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            allowClear
            placeholder={t('label.filterCategory')}
            style={{ width: 220 }}
            options={categories.map((value) => ({ value, label: value }))}
            value={category}
            onChange={setCategory}
          />
          <div className="summary-chip">
            {t('label.totalTracks', {
              count: filtered.length,
              duration: formatDuration(filtered.reduce((sum, item) => sum + item.durationSec, 0))
            })}
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10 }}
          className="library-table"
        />
      </Card>
    </div>
  );
}
