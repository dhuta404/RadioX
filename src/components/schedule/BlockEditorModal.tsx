import dayjs from 'dayjs';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Switch } from 'antd';
import { v4 as uuid } from 'uuid';
import { useI18n } from '@/i18n';
import { LibraryItem, ScheduleBlock } from '@/types/app';

type Props = {
  open: boolean;
  library: LibraryItem[];
  initialBlock?: ScheduleBlock;
  onCancel: () => void;
  onSave: (block: ScheduleBlock) => void;
};

const DEFAULT_COLORS = ['#2f7fff', '#ff7a45', '#19c37d', '#eb2f96', '#fadb14'];

export function BlockEditorModal({ open, library, initialBlock, onCancel, onSave }: Props) {
  const [form] = Form.useForm<ScheduleBlock>();
  const { t } = useI18n();
  const categoryOptions = Array.from(new Set(library.map((item) => item.category))).filter(Boolean);
  const tagOptions = Array.from(new Set(library.flatMap((item) => item.tags))).filter(Boolean);

  return (
    <Modal
      width={760}
      open={open}
      onCancel={onCancel}
      title={initialBlock ? t('modal.editBlock') : t('modal.newBlock')}
      footer={null}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (!visible) return;
        const block = initialBlock || {
          id: uuid(),
          name: '新节目',
          start: dayjs().minute(0).second(0).toISOString(),
          end: dayjs().minute(30).second(0).toISOString(),
          enabled: true,
          priority: 1,
          color: DEFAULT_COLORS[0],
          repeat: 'none',
          repeatDays: [],
          sourceMode: 'category',
          playlistTrackIds: [],
          sourceCategory: categoryOptions[0],
          sourceTag: undefined,
          fillerCategory: 'Filler',
          exceptionDates: [],
          rule: {
            playbackMode: 'sequential',
            avoidRepeatCount: 3,
            preferUnplayed: true,
            category: categoryOptions[0]
          }
        };
        form.setFieldsValue({
          ...block,
          start: dayjs(block.start).format('YYYY-MM-DDTHH:mm'),
          end: dayjs(block.end).format('YYYY-MM-DDTHH:mm')
        });
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={(values) => onSave(values as unknown as ScheduleBlock)}
        className="block-form"
      >
        <Form.Item label={t('form.name')} name="name" rules={[{ required: true, message: t('form.name') }]}>
          <Input />
        </Form.Item>

        <div className="form-grid">
          <Form.Item label={t('form.start')} name="start" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item label={t('form.end')} name="end" rules={[{ required: true }]}>
            <Input type="datetime-local" />
          </Form.Item>
        </div>

        <div className="form-grid">
          <Form.Item label={t('form.sourceType')} name="sourceMode">
            <Select
              options={[
                { value: 'playlist', label: t('label.sourceMode.playlist') },
                { value: 'category', label: t('label.sourceMode.category') },
                { value: 'random', label: t('label.sourceMode.random') },
                { value: 'filler', label: t('label.sourceMode.filler') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('form.color')} name="color">
            <Select options={DEFAULT_COLORS.map((value) => ({ value, label: value }))} />
          </Form.Item>
        </div>

        <div className="form-grid">
          <Form.Item label={t('form.sourceCategory')} name="sourceCategory">
            <Select allowClear options={categoryOptions.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item label={t('form.sourceTag')} name="sourceTag">
            <Select allowClear options={tagOptions.map((value) => ({ value, label: value }))} />
          </Form.Item>
        </div>

        <Form.Item label={t('form.playlist')} name="playlistTrackIds">
          <Select
            mode="multiple"
            options={library.map((item) => ({ value: item.id, label: item.title }))}
          />
        </Form.Item>

        <div className="form-grid">
          <Form.Item label={t('form.repeat')} name="repeat">
            <Select
              options={[
                { value: 'none', label: t('label.repeat.none') },
                { value: 'daily', label: t('label.repeat.daily') },
                { value: 'weekly', label: t('label.repeat.weekly') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('form.priority')} name="priority">
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className="form-grid">
          <Form.Item label={t('form.playbackMode')} name={['rule', 'playbackMode']}>
            <Select
              options={[
                { value: 'sequential', label: t('label.playbackMode.sequential') },
                { value: 'random', label: t('label.playbackMode.random') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('form.avoidRepeat')} name={['rule', 'avoidRepeatCount']}>
            <InputNumber min={0} max={50} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className="form-grid">
          <Form.Item label={t('form.maxMinutes')} name={['rule', 'maxDurationMinutes']}>
            <InputNumber min={1} max={240} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={t('form.skipThreshold')} name={['rule', 'skipIfRemainingLessThanSec']}>
            <InputNumber min={0} max={3600} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className="form-grid">
          <Form.Item label={t('form.preferUnplayed')} name={['rule', 'preferUnplayed']} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label={t('form.enabled')} name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <Space>
          <Button onClick={onCancel}>{t('button.cancel')}</Button>
          <Button type="primary" htmlType="submit">
            {t('button.saveBlock')}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
