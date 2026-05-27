import { AlertCircle, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import type { Page } from '../App';
import type { AppState } from '../store/appStore';
import { summarizeHandoverReadiness } from '../utils/handover';

interface HandoverPageProps {
  state: AppState;
  onNavigate: (page: Page) => void;
}

export function HandoverPage({ state, onNavigate }: HandoverPageProps) {
  const summary = summarizeHandoverReadiness(state);

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">交付前最后确认</span>
        <h1>签字前确认</h1>
        <p>把未完成关键项、未落实权益和未解决问题放在一起看，确认清楚后再继续。</p>
      </header>

      <section className="inspection-dashboard">
        <div className="progress-summary">
          <div>
            <span className="section-kicker">当前状态</span>
            <strong>{summary.blocked ? '暂缓' : '可继续'}</strong>
          </div>
          <span>{summary.blocked ? '还有事项需要确认' : '关键事项已清空'}</span>
        </div>
        <div className="risk-strip">
          <span>关键项 {summary.unfinishedCriticalItems.length}</span>
          <span>权益 {summary.openPromises.length}</span>
          <span>问题 {summary.openIssues.length}</span>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>未完成关键项</h2>
          <span>{summary.unfinishedCriticalItems.length} 项</span>
        </div>
        {summary.unfinishedCriticalItems.slice(0, 8).map((item) => (
          <div className="list-item" key={item.id}>
            <ClipboardCheck size={18} />
            <div>
              <strong>{item.text}</strong>
              <p>{item.critical ? '关键项' : '普通项'} · 未勾选</p>
            </div>
          </div>
        ))}
        {summary.unfinishedCriticalItems.length === 0 && <p className="empty">关键验车项已完成。</p>}
        <ActionButton onClick={() => onNavigate('delivery')}>回到验车</ActionButton>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>未落实权益</h2>
          <span>{summary.openPromises.length} 项</span>
        </div>
        {summary.openPromises.slice(0, 6).map((item) => (
          <div className="list-item" key={item.id}>
            <ShieldCheck size={18} />
            <div>
              <strong>{state.privacyMode ? '权益事项待确认' : item.name}</strong>
              <p>{item.status} · {item.spec ?? item.value ?? '明细待确认'}</p>
            </div>
          </div>
        ))}
        {summary.openPromises.length === 0 && <p className="empty">权益事项已清空。</p>}
        <ActionButton onClick={() => onNavigate('promises')}>查看权益</ActionButton>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>未解决问题</h2>
          <span>{summary.openIssues.length} 项</span>
        </div>
        {summary.openIssues.map((item) => (
          <div className="list-item" key={item.id}>
            {item.status === '已解决' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>{item.title}</strong>
              <p>{item.issueType} · {item.owner ?? '责任人待确认'} · {item.nextReminderDate || item.expectedDate || '提醒待确认'}</p>
            </div>
          </div>
        ))}
        {summary.openIssues.length === 0 && <p className="empty">暂无未解决问题。</p>}
        <ActionButton onClick={() => onNavigate('issue')}>查看问题</ActionButton>
      </section>
    </div>
  );
}
