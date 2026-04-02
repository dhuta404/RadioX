import { Button, Card, Form, Segmented, Switch, message } from 'antd';
import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store/app-store';

export function SettingsPage() {
  const { data, saveData, appendLog } = useAppStore();
  const { t } = useI18n();
  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  if (!data) return null;

  return (
    <div className="page-wrap">
      {contextHolder}
      <PageHeader
        eyebrow="System Settings"
        title={t('page.settings.title')}
        description={t('page.settings.desc')}
      />

      <Card className="soft-panel">
        <Form
          form={form}
          layout="vertical"
          initialValues={data.settings}
          onFinish={async (values) => {
            await saveData({ ...data, settings: values });
            await appendLog('settings', '已更新系统设置。');
            msgApi.success(t('msg.saved'));
          }}
        >
          <Form.Item label={t('label.language')} name="language">
            <Segmented
              options={[
                { value: 'zh-CN', label: t('lang.zh') },
                { value: 'en-US', label: t('lang.en') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('label.launchOnStartup')} name="launchOnStartup" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label={t('label.minimizeToTray')} name="minimizeToTray" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label={t('label.enableLogs')} name="logsEnabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('button.save')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
