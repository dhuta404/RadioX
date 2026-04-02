import {
  CalendarOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  SettingOutlined,
  SlidersOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useMemo } from 'react';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/store/app-store';
import { DashboardPage } from '@/pages/DashboardPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { LibraryPage } from '@/pages/LibraryPage';
import { RulesPage } from '@/pages/RulesPage';
import { SettingsPage } from '@/pages/SettingsPage';

const { Sider, Content } = Layout;

export function AppShell() {
  const { selectedPage, setSelectedPage } = useAppStore();
  const { t } = useI18n();

  const page = useMemo(() => {
    switch (selectedPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'library':
        return <LibraryPage />;
      case 'rules':
        return <RulesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  }, [selectedPage]);

  return (
    <>
      <Sider width={268} className="app-sidebar">
        <div className="brand-card">
          <div className="brand-logo">R</div>
          <div>
            <div className="brand-title">RadioFlow</div>
            <div className="brand-subtitle">{t('brand.subtitle')}</div>
          </div>
        </div>

        <div className="brand-hero">
          <div className="hero-label">ON AIR</div>
          <div className="hero-title">{t('hero.title')}</div>
          <div className="hero-copy">{t('hero.copy')}</div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedPage]}
          onClick={({ key }) => setSelectedPage(key as typeof selectedPage)}
          className="nav-menu"
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
            { key: 'schedule', icon: <CalendarOutlined />, label: t('nav.schedule') },
            { key: 'library', icon: <CustomerServiceOutlined />, label: t('nav.library') },
            { key: 'rules', icon: <SlidersOutlined />, label: t('nav.rules') },
            { key: 'settings', icon: <SettingOutlined />, label: t('nav.settings') }
          ]}
        />

        <Button className="sidebar-tip" type="default">
          {t('sidebar.tip')}
        </Button>
      </Sider>

      <Layout>
        <Content className="app-content">{page}</Content>
      </Layout>
    </>
  );
}
