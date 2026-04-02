import { useEffect } from 'react';
import { App as AntApp, ConfigProvider, Layout, Spin, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useAppStore } from '@/store/app-store';
import { AppShell } from '@/components/AppShell';
import { AutomationEngine } from '@/modules/automation/AutomationEngine';

export default function App() {
  const { load, loading, data } = useAppStore();

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="app-loading">
        <Spin size="large" />
        <div>正在准备本地广播工作台…</div>
      </div>
    );
  }

  return (
    <ConfigProvider
      locale={data.settings.language === 'en-US' ? enUS : zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ff5a36',
          borderRadius: 16,
          colorBgBase: '#090d18',
          fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
        }
      }}
    >
      <AntApp>
        <Layout className="app-layout">
          <AutomationEngine />
          <AppShell />
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}
