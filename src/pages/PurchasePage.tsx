import { Copy, FileCheck2, MessageSquareText, Pencil, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { Page } from '../App';
import type { RecognitionType } from '../model/types';
import type { Quote } from '../model/types';
import type { AppState } from '../store/appStore';

interface PurchasePageProps {
  state: AppState;
  onNavigate: (page: Page) => void;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onAddQuote: () => void;
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
}

export function PurchasePage({ state, onNavigate, onUpload, onMarkdownImport, onAddQuote, onEditQuote, onDeleteQuote }: PurchasePageProps) {
  const pending = state.recognitionTasks.filter((item) => item.status === '待确认' && ['报价', '承诺'].includes(item.recognitionType));
  const subsidies = state.promises.filter((item) => item.type === '补贴' || item.type === '费用减免');
  const openPromises = state.promises.filter((item) => item.status === '待落实' || item.status === '有争议');
  const confirmedQuotes = state.quotes.length;
  const confirmText = state.promises
    .filter((item) => item.status !== '已落实')
    .map((item) => `请确认：${item.name}${item.value ? `，价值/金额 ${item.value} 元` : ''}${item.spec ? `，规格 ${item.spec}` : ''}，当前状态为${item.status}。`)
    .join('\n');

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">报价管家</span>
        <h1>购车</h1>
        <p>报价、补贴和权益先形成草稿，再确认保存，现场查看保持克制清楚。</p>
      </header>

      <section className="equity-overview">
        <div>
          <span className="section-kicker">购车总览</span>
          <strong>{confirmedQuotes}</strong>
          <p>已确认报价 · {openPromises.length} 项权益待落实</p>
        </div>
        <div className="overview-actions">
          <div>
            <ShieldCheck size={17} />
            <span>权益待处理 {openPromises.length}</span>
          </div>
          <div>
            <Upload size={17} />
            <span>待确认草稿 {pending.length}</span>
          </div>
        </div>
        <div className="button-row compact-action-row">
          <ActionButton icon={<Plus size={16} />} onClick={onAddQuote} variant="primary">新增报价</ActionButton>
          <ActionButton icon={<Upload size={16} />} onClick={() => onNavigate('recognition')}>处理草稿</ActionButton>
        </div>
      </section>

      <section className="priority-panel">
        <div className="section-kicker">当前要确认</div>
        <div className="priority-content">
          <div className="priority-icon">
            <FileCheck2 size={22} />
          </div>
          <div>
            <strong>{pending[0]?.sourceName ?? openPromises[0]?.name ?? '先确认报价和权益口径'}</strong>
            <p className="muted">建议先把金额、权益名称、规格和状态改准确，再保存到正式记录。</p>
          </div>
        </div>
      </section>

      {pending.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2>待确认草稿</h2>
            <span>{pending.length} 项</span>
          </div>
          {pending.map((item) => (
            <div className="list-item" key={item.id}>
              <MessageSquareText size={18} />
              <div>
                <strong>{item.sourceName}</strong>
                <p>{item.recognitionType === '承诺' ? '权益' : item.recognitionType} · {item.status}</p>
              </div>
              <StatusPill label={item.status} />
            </div>
          ))}
        </section>
      )}

      <section className="content-section">
        <div className="section-header">
          <h2>报价明细</h2>
          <ActionButton icon={<Plus size={16} />} onClick={onAddQuote}>新增</ActionButton>
        </div>
        {state.quotes.length === 0 ? (
          <p className="empty">还没有确认报价。可以先导入截图或手动新增一条。</p>
        ) : (
          state.quotes.map((quote) => (
            <div className="summary-box" key={quote.id}>
              <strong>{quote.title}</strong>
              <p>落地价：{quote.landingPrice ?? '-'} 元 · 补贴：{quote.subsidyTotal ?? '-'} 元</p>
              <p>{quote.store ?? '门店待确认'} · {quote.salesName ?? '顾问待确认'}</p>
              <div className="mini-actions">
                <button onClick={() => onEditQuote(quote)}><Pencil size={14} />编辑</button>
                <button onClick={() => onDeleteQuote(quote.id)}><Trash2 size={14} />删除</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>补贴明细</h2>
          <span>{subsidies.length} 项</span>
        </div>
        {subsidies.length === 0 ? (
          <p className="empty">暂无补贴或费用减免记录。</p>
        ) : (
          subsidies.map((item) => (
            <div className="list-item" key={item.id}>
              <ShieldCheck size={18} />
              <div>
                <strong>{item.name}</strong>
                <p>{item.value ? `${item.value} 元` : item.spec ?? '待确认'}</p>
              </div>
              <StatusPill label={item.status} />
            </div>
          ))
        )}
      </section>

      <Card title="确认文字" action={<ActionButton icon={<Copy size={16} />} onClick={() => navigator.clipboard?.writeText(confirmText)}>复制</ActionButton>}>
        <pre className="confirm-text">{confirmText || '暂无需要确认的权益。'}</pre>
      </Card>

      <UploadDraftPanel title="快速导入报价和权益资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['报价', '承诺']} />
    </div>
  );
}
