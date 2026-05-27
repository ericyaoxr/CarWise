import { AlertCircle, Camera, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { Issue, RecognitionType } from '../model/types';
import type { AppState } from '../store/appStore';

interface IssuePageProps {
  state: AppState;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onResolve: (id: string) => void;
  onAdd: () => void;
  onEdit: (issue: Issue) => void;
  onDelete: (id: string) => void;
}

function formatDeadline(issue?: Issue) {
  if (!issue?.expectedDate) return '截止时间待确认';
  return `截止 ${issue.expectedDate}`;
}

export function IssuePage({ state, onUpload, onMarkdownImport, onResolve, onAdd, onEdit, onDelete }: IssuePageProps) {
  const openIssues = state.issues
    .filter((issue) => issue.status !== '已解决')
    .sort((left, right) => String(left.expectedDate || '9999-12-31').localeCompare(String(right.expectedDate || '9999-12-31')));
  const resolvedIssues = state.issues.filter((issue) => issue.status === '已解决');
  const currentIssue = openIssues[0];

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">问题管家</span>
        <h1>问题留证</h1>
        <p>有问题先留证，再记录责任人、处理方式和预计时间，现场不用反复解释。</p>
      </header>

      <section className="inspection-dashboard">
        <div className="progress-summary">
          <div>
            <span className="section-kicker">问题总览</span>
            <strong>{openIssues.length}</strong>
          </div>
          <span>未解决 · 已解决 {resolvedIssues.length}</span>
        </div>
        <div className="risk-strip">
          <span>未解决 {openIssues.length}</span>
          <span>待跟进 {openIssues.filter((issue) => issue.status === '待处理' || issue.status === '处理中').length}</span>
          <span>已解决 {resolvedIssues.length}</span>
        </div>
        <ActionButton icon={<Plus size={16} />} onClick={onAdd} variant="primary">新增问题</ActionButton>
      </section>

      <section className="priority-panel">
        <div className="section-kicker">当前要处理</div>
        <div className="priority-content">
          <div className="priority-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <strong>{currentIssue?.title ?? '暂无未解决问题'}</strong>
            <p className="muted">{currentIssue ? `${currentIssue.issueType} · ${currentIssue.owner ?? '责任人待确认'} · ${formatDeadline(currentIssue)}` : '发现问题时，先拍照并补充处理方式和时间。'}</p>
            {currentIssue?.resolution && <p className="muted">{currentIssue.resolution}</p>}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>问题记录</h2>
          <span>{state.issues.length} 条</span>
        </div>
        {state.issues.length === 0 ? (
          <p className="empty">还没有问题记录。验车页点击相机图标，或这里拍照生成问题草稿。</p>
        ) : (
          state.issues.map((issue) => (
            <div className="issue-row" key={issue.id}>
              <Camera size={18} />
              <div>
                <strong>{issue.title}</strong>
                <p>{issue.description}</p>
                <p>问题类型：{issue.issueType} · 责任人：{issue.owner ?? '待确认'}</p>
                <p>截止时间：{issue.expectedDate || '待确认'} · {issue.stage}</p>
              </div>
              <StatusPill label={issue.status} />
              <div className="mini-actions vertical">
                <button onClick={() => onEdit(issue)}><Pencil size={14} />编辑</button>
                <button onClick={() => onDelete(issue.id)}><Trash2 size={14} />删除</button>
              </div>
              {issue.status !== '已解决' && (
                <ActionButton icon={<CheckCircle2 size={16} />} onClick={() => onResolve(issue.id)}>标记解决</ActionButton>
              )}
            </div>
          ))
        )}
      </section>

      <UploadDraftPanel title="快速导入问题资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['问题']} />
    </div>
  );
}
