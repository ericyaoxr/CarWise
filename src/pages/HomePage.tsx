import { AlertCircle, Bell, CheckCircle2, ClipboardList, Eye, EyeOff, FileCheck2, ShieldCheck, Upload } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { Page } from '../App';
import type { AppState } from '../store/appStore';
import type { RecognitionType } from '../model/types';
import { deriveTimeline } from '../utils/timeline';

interface HomePageProps {
  state: AppState;
  onNavigate: (page: Page) => void;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onPrivacyModeChange: (privacyMode: boolean) => void;
}

export function HomePage({ state, onNavigate, onUpload, onMarkdownImport, onPrivacyModeChange }: HomePageProps) {
  const pendingDrafts = state.recognitionTasks.filter((item) => item.status === '待确认');
  const openPromises = state.promises.filter((item) => item.status === '待落实' || item.status === '有争议');
  const doneItems = state.checklistItems.filter((item) => item.done).length;
  const openIssueItems = state.issues.filter((item) => item.status !== '已解决');
  const openIssues = openIssueItems.length;
  const nextReminder = state.reminders.find((item) => item.status !== '已完成' && item.status !== '已忽略');
  const rawNextTodo = pendingDrafts[0]?.sourceName ?? openPromises[0]?.name ?? openIssueItems[0]?.title ?? nextReminder?.name ?? '继续完善车辆档案';
  const nextTodo = state.privacyMode && openPromises.some((item) => item.name === rawNextTodo) ? '权益事项待确认' : rawNextTodo;
  const timeline = deriveTimeline(state).slice(0, 4);
  const checklistPercent = Math.round((doneItems / state.checklistItems.length) * 100);
  const totalTodos = pendingDrafts.length + openPromises.length + openIssues;

  return (
    <div className="page advisor-page">
      <header className="advisor-hero">
        <div className="hero-topline">
          <span>CarWise 私人管家</span>
          <StatusPill label={state.vehicle.status} />
        </div>
        <h1>{state.vehicle.name}</h1>
        <p>{state.vehicle.brand} {state.vehicle.model} · {state.vehicle.exteriorColor} / {state.vehicle.interiorColor}</p>
        <div className="hero-status-grid">
          <div>
            <small>待办</small>
            <strong>{totalTodos}</strong>
          </div>
          <div>
            <small>验车</small>
            <strong>{checklistPercent}%</strong>
          </div>
          <div>
            <small>权益</small>
            <strong>{openPromises.length}</strong>
          </div>
        </div>
      </header>

      <button className="privacy-toggle privacy-toggle-quiet" type="button" onClick={() => onPrivacyModeChange(!state.privacyMode)}>
        {state.privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
        <span>{state.privacyMode ? '低调模式开启' : '低调模式关闭'}</span>
      </button>

      <section className="priority-panel">
        <div className="section-kicker">当前最该处理</div>
        <div className="priority-content">
          <div className="priority-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>{nextTodo}</strong>
            <p className="muted">优先处理待确认内容、未落实权益和未解决问题。</p>
          </div>
        </div>
        <div className="button-row compact-action-row">
          <ActionButton icon={<Upload size={16} />} onClick={() => onNavigate('recognition')} variant="primary">处理待确认</ActionButton>
          <ActionButton icon={<ClipboardList size={16} />} onClick={() => onNavigate('delivery')}>继续验车</ActionButton>
        </div>
      </section>

      <section className="insight-grid">
        <button className="insight-tile" onClick={() => onNavigate('recognition')}>
          <FileCheck2 size={18} />
          <span>待确认</span>
          <strong>{pendingDrafts.length}</strong>
        </button>
        <button className="insight-tile" onClick={() => onNavigate('promises')}>
          <ShieldCheck size={18} />
          <span>未落实权益</span>
          <strong>{openPromises.length}</strong>
        </button>
        <button className="insight-tile" onClick={() => onNavigate('delivery')}>
          <ClipboardList size={18} />
          <span>验车进度</span>
          <strong>{doneItems}/{state.checklistItems.length}</strong>
        </button>
        <button className="insight-tile" onClick={() => onNavigate('issue')}>
          <AlertCircle size={18} />
          <span>未解决问题</span>
          <strong>{openIssues}</strong>
        </button>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>下一次提醒</h2>
        </div>
        {nextReminder ? (
          <div className="list-item">
            <Bell size={18} />
            <div>
              <strong>{nextReminder.name}</strong>
              <p>{nextReminder.dueDate ?? `${nextReminder.dueMileage ?? '-'} 公里`} · {nextReminder.status}</p>
            </div>
          </div>
        ) : (
          <p className="empty">暂无提醒。</p>
        )}
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>最近时间线</h2>
        </div>
        {timeline.map((event) => (
          <div className="list-item" key={event.id}>
            {event.type === '问题' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <div>
              <strong>{event.title}</strong>
              <p>{event.date} · {event.description}</p>
            </div>
          </div>
        ))}
      </section>

      <UploadDraftPanel
        title="快速导入资料（可选）"
        onUpload={onUpload}
        onMarkdownImport={onMarkdownImport}
        compact
      />
    </div>
  );
}
