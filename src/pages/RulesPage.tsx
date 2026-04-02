import { Button, Card, Form, InputNumber, Select, Space, Switch, message } from 'antd';
import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store/app-store';

export function RulesPage() {
  const { data, saveData, appendLog } = useAppStore();
  const { t } = useI18n();
  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  if (!data) return null;

  const categoryOptions = Array.from(new Set(data.library.map((item) => item.category))).filter(Boolean);

  return (
    <div className="page-wrap">
      {contextHolder}
      <PageHeader
        eyebrow="Global Rules"
        title={t('page.rules.title')}
        description={t('page.rules.desc')}
      />

      <Card className="soft-panel">
        <Form
          form={form}
          layout="vertical"
          initialValues={data.globalRules}
          onFinish={async (values) => {
            await saveData({ ...data, globalRules: values });
            await appendLog('rules', '已更新全局规则。');
            msgApi.success(t('msg.saved'));
          }}
        >
          <div className="form-grid">
            <Form.Item label={t('form.defaultFiller')} name="defaultFillerCategory">
              <Select options={categoryOptions.map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item label={t('form.defaultVolume')} name="defaultVolume">
              <InputNumber min={0.1} max={1} step={0.05} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item label={t('form.fallbackPool')} name="fallbackTrackIds">
            <Select
              mode="multiple"
              options={data.library.map((item) => ({ value: item.id, label: item.title }))}
            />
          </Form.Item>

          <div className="form-grid">
            <Form.Item label={t('form.crossfadeSec')} name="crossfadeSec">
              <InputNumber min={0} max={15} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('form.transitionFadeSec')} name="transitionFadeSec">
              <InputNumber min={0} max={15} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="form-grid">
            <Form.Item label={t('form.silenceProtection')} name="silenceProtection" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label={t('form.skipBroken')} name="skipBrokenFiles" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Space>
            <Button type="primary" htmlType="submit">
              {t('button.save')}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
