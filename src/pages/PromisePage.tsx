import { AlertCircle, CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';

import type { AppState } from '../store/appStore';
import type { PromiseStatus, RecognitionType, SalesPromise } from '../model/types';
import { StatusPill } from '../components/StatusPill';
import { ActionButton } from '../components/ActionButton';
import { UploadDraftPanel } from '../components/UploadDraftPanel';

interface PromisePageProps {
  state: AppState;
  onStatusChange: (id: string, status: PromiseStatus) => void;
  onAdd: () => void;
  onEdit: (promise: SalesPromise) => void;
  onDelete: (id: string) => void;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onPrivacyModeChange: (privacyMode: boolean) => void;
}

const statuses: PromiseStatus[] = ['未确认', '已确认', '待落实', '已落实', '有争议'];

export function PromisePage({ state, onStatusChange, onAdd, onEdit, onDelete, onUpload, onMarkdownImport, onPrivacyModeChange }: PromisePageProps) {
  const openPromises = state.promises.filter((item) => item.status === '待落实' || item.status === '有争议');
  const donePromises = state.promises.filter((item) => item.status === '已落实');
  const confirmedPromises = state.promises.filter((item) => item.status === '已确认' || item.status === '已落实');
  const total = state.promises.length || 1;
  const completion = Math.round((donePromises.length / total) * 100);

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">权益状态</span>
        <h1>权益</h1>
        <p>赠品、补贴、服务和费用减免集中管理，现场只看必要信息。</p>
      </header>

      <button className="privacy-toggle" type="button" onClick={() => onPrivacyModeChange(!state.privacyMode)}>
        {state.privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
        <span>{state.privacyMode ? '低调模式开启' : '低调模式关闭'}</span>
      </button>

      <section className="equity-overview">
        <div>
          <span className="section-kicker">落实进度</span>
          <strong>{completion}%</strong>
          <p>已落实 {donePromises.length} / {state.promises.length} 项</p>
        </div>
        <div className="progress-line calm-progress">
          <span style={{ width: `${completion}%` }} />
        </div>
        <div className="overview-actions">
          <div>
            <AlertCircle size={17} />
            <span>待处理 {openPromises.length}</span>
          </div>
          <div>
            <CheckCircle2 size={17} />
            <span>已确认 {confirmedPromises.length}</span>
          </div>
        </div>
        <ActionButton icon={<Plus size={16} />} onClick={onAdd} variant="primary">新增权益</ActionButton>
      </section>

      <section className="content-section no-frame">
        <div className="section-header">
          <h2>权益清单</h2>
          <span>{state.promises.length} 项</span>
        </div>
        <div className="equity-list">
        {state.promises.map((item, index) => (
          <article className={`equity-card ${item.status === '已落实' ? 'is-complete' : ''}`} key={item.id}>
            <div className="equity-main">
              <span>{item.type}</span>
              <strong>{state.privacyMode ? `权益事项 ${index + 1}` : item.name}</strong>
              <p>
                {state.privacyMode
                  ? item.value || item.spec ? '明细已记录' : '待补充明细'
                  : `${item.value ? `${item.value} 元` : ''}${item.value && item.spec ? ' · ' : ''}${item.spec ? item.spec : ''}` || '未填写金额或规格'}
              </p>
            </div>
            <div className="equity-side">
              <StatusPill label={item.status} />
              <div className="mini-actions">
                <button onClick={() => onEdit(item)}><Pencil size={14} />编辑</button>
                <button onClick={() => onDelete(item.id)}><Trash2 size={14} />删除</button>
              </div>
            </div>
            <div className="segmented">
              {statuses.map((status) => (
                <button key={status} className={item.status === status ? 'selected' : ''} onClick={() => onStatusChange(item.id, status)}>
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
        </div>
      </section>

      <UploadDraftPanel title="快速导入权益资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['承诺']} />
    </div>
  );
}
