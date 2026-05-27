import { AlertCircle, Camera, CheckCircle2 } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { Page } from '../App';
import type { RecognitionType } from '../model/types';
import type { AppState } from '../store/appStore';

interface DeliveryPageProps {
  state: AppState;
  onToggle: (id: string) => void;
  onCreateIssue: (id: string) => void;
  onNavigate: (page: Page) => void;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
}

export function DeliveryPage({ state, onToggle, onCreateIssue, onNavigate, onUpload, onMarkdownImport }: DeliveryPageProps) {
  const done = state.checklistItems.filter((item) => item.done).length;
  const openIssues = state.issues.filter((item) => item.status !== '已解决');
  const criticalLeft = state.checklistItems.filter((item) => item.critical && !item.done).length;
  const percent = Math.round((done / state.checklistItems.length) * 100);

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">交付现场</span>
        <h1>提车验车</h1>
        <p>按步骤确认，发现问题先留证，交付前只看未完成项。</p>
      </header>

      <section className="inspection-dashboard">
        <div className="progress-summary">
          <div>
            <span className="section-kicker">整体进度</span>
            <strong>{percent}%</strong>
          </div>
          <span>{done} / {state.checklistItems.length} 项完成</span>
        </div>
        <div className="progress-line inspection-progress">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="risk-strip">
          <span>{criticalLeft} 个关键项未完成</span>
          <span>{openIssues.length} 个问题未解决</span>
        </div>
      </section>

      {state.checklistGroups.map((group) => {
        const items = state.checklistItems.filter((item) => item.groupId === group.id);
        const groupDone = items.filter((item) => item.done).length;
        return (
          <section className="inspection-group" key={group.id}>
            <div className="inspection-group-head">
              <div>
                <span>{String(group.order).padStart(2, '0')}</span>
                <h2>{group.name}</h2>
              </div>
              <StatusPill label={`完成 ${groupDone}/${items.length}`} />
            </div>
            <div className="inspection-list">
              {items.map((item) => (
                <div className={`check-row ${item.done ? 'done' : ''} ${item.hasIssue ? 'has-issue' : ''}`} key={item.id}>
                  <button className="check-toggle" onClick={() => onToggle(item.id)} aria-label={item.done ? '取消完成' : '标记完成'}>
                    {item.done ? <CheckCircle2 size={20} /> : <span />}
                  </button>
                  <span>{item.text}</span>
                  <button className="icon-button" title="标记问题并跟进" onClick={() => onCreateIssue(item.id)}>
                    {item.hasIssue ? <AlertCircle size={18} /> : <Camera size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="handover-guard">
        <div className="section-header">
          <h2>签字前确认总表</h2>
        </div>
        <div className="risk-strip">
          <span>未完成关键项：{criticalLeft}</span>
          <span>未解决问题：{openIssues.length}</span>
        </div>
        <ActionButton variant="danger" icon={<AlertCircle size={16} />} onClick={() => onNavigate('handover')}>查看总表</ActionButton>
      </section>

      <UploadDraftPanel title="快速导入提车资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['问题', '承诺']} />
    </div>
  );
}
