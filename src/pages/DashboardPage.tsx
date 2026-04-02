import { Button, Card, Col, List, Progress, Row, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { useI18n } from '@/i18n';
import { PageHeader } from '@/components/PageHeader';
import { useAppStore } from '@/store/app-store';
import { useTransportStore } from '@/store/transport-store';
import { formatClock, formatDuration } from '@/utils/time';
import { getBlocksForDate, getNextBlock } from '@/utils/schedule';

export function DashboardPage() {
  const { data, engine } = useAppStore();
  const { startAutomation, stopAutomation, togglePause, skipTrack } = useTransportStore();
  const { t } = useI18n();

  if (!data) return null;

  const todayBlocks = getBlocksForDate(data.scheduleBlocks, dayjs());
  const nextBlock = getNextBlock(data.scheduleBlocks, dayjs());
  const progress =
    engine.currentTrack && data.playback.currentTrackDurationSec
      ? ((data.playback.currentTrackDurationSec - engine.remainingSec) /
          data.playback.currentTrackDurationSec) *
        100
      : 0;

  return (
    <div className="page-wrap">
      <PageHeader
        eyebrow="Live Control"
        title={t('page.dashboard.title')}
        description={t('page.dashboard.desc')}
        extra={
          <Space>
            <Button type="primary" size="large" onClick={startAutomation}>
              {t('button.start')}
            </Button>
            <Button size="large" onClick={togglePause}>
              {data.playback.paused ? t('button.resume') : t('button.pause')}
            </Button>
            <Button danger size="large" onClick={stopAutomation}>
              {t('button.stop')}
            </Button>
          </Space>
        }
      />

      <Row gutter={[20, 20]}>
        <Col span={16}>
          <Card className="hero-panel">
            <div className="hero-topline">NOW PLAYING</div>
            <div className="hero-main">
              <div>
                <div className="now-title">{engine.currentTrack?.title || t('state.waiting')}</div>
                <div className="now-subtitle">
                  {engine.activeBlock?.name || t('state.noBlock')}
                </div>
              </div>
              <Tag color={data.playback.automationEnabled ? 'success' : 'default'} className="status-pill">
                {data.playback.automationEnabled ? t('status.autoOn') : t('status.stopped')}
              </Tag>
            </div>

            <Progress percent={Math.max(0, Math.min(100, Math.round(progress)))} showInfo={false} />

            <div className="hero-stats">
              <div>
                <span>{t('label.currentTime')}</span>
                <strong>{dayjs(engine.now).format('YYYY-MM-DD HH:mm:ss')}</strong>
              </div>
              <div>
                <span>{t('label.remaining')}</span>
                <strong>{formatDuration(engine.remainingSec)}</strong>
              </div>
              <div>
                <span>{t('label.nextShow')}</span>
                <strong>{nextBlock ? `${formatClock(nextBlock.start)} ${nextBlock.name}` : t('misc.none')}</strong>
              </div>
              <div>
                <span>{t('label.nextTrack')}</span>
                <strong>{engine.nextTrack?.title || t('misc.none')}</strong>
              </div>
            </div>

            <Space>
              <Button onClick={skipTrack}>{t('button.skip')}</Button>
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="soft-panel">
            <div className="mini-kpi-title">{t('label.systemStatus')}</div>
            <div className="mini-kpi-grid">
              <div>
                <span>{t('label.libraryCount')}</span>
                <strong>{data.library.length}</strong>
              </div>
              <div>
                <span>{t('label.blocksToday')}</span>
                <strong>{todayBlocks.length}</strong>
              </div>
              <div>
                <span>{t('label.fillerCategory')}</span>
                <strong>{data.globalRules.defaultFillerCategory || t('misc.unspecified')}</strong>
              </div>
              <div>
                <span>{t('label.crossfade')}</span>
                <strong>{data.globalRules.crossfadeSec}s</strong>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={14}>
          <Card className="soft-panel">
            <div className="section-title">{t('label.todaySchedule')}</div>
            <List
              dataSource={todayBlocks}
              renderItem={(block) => (
                <List.Item>
                  <div className="list-row">
                    <div className="color-dot" style={{ background: block.color }} />
                    <div className="list-main">
                    <div>{block.name}</div>
                    <small>
                        {formatClock(block.start)} - {formatClock(block.end)} / {t(`label.sourceMode.${block.sourceMode}`)}
                    </small>
                  </div>
                    <Tag>{t(`label.playbackMode.${block.rule.playbackMode}`)}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={10}>
          <Card className="soft-panel">
            <div className="section-title">{t('label.recentLogs')}</div>
            <List
              size="small"
              dataSource={data.logs.slice(0, 8)}
              renderItem={(log) => (
                <List.Item>
                  <div className="log-row">
                    <div>{log.message}</div>
                    <small>{dayjs(log.time).format('HH:mm:ss')}</small>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
