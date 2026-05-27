import { useState } from 'react';
import { Car, FileText, History, ShieldCheck } from 'lucide-react';

import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { RecognitionType } from '../model/types';
import type { AppState } from '../store/appStore';
import { filterSourceFiles, type ArchiveFilter } from '../utils/ownerAssistant';
import { deriveTimeline } from '../utils/timeline';

interface ArchivePageProps {
  state: AppState;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
}

const archiveFilters: ArchiveFilter[] = ['全部', '权益', '问题', '费用', '车辆文件', '其他'];

export function ArchivePage({ state, onUpload, onMarkdownImport }: ArchivePageProps) {
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('全部');
  const [archiveQuery, setArchiveQuery] = useState('');
  const timeline = deriveTimeline(state);
  const displayPurpose = (purpose: string) => purpose === '承诺' ? '权益' : purpose;
  const visibleFiles = filterSourceFiles(state.sourceFiles, archiveFilter, archiveQuery);

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">档案管家</span>
        <h1>车辆档案</h1>
        <p>车辆信息、凭证文件和完整时间线集中存放，之后查证不用翻聊天记录。</p>
      </header>

      <section className="equity-overview">
        <div>
          <span className="section-kicker">档案总览</span>
          <strong>{state.sourceFiles.length}</strong>
          <p>文件资料 · {timeline.length} 条时间线记录</p>
        </div>
        <div className="overview-actions">
          <div>
            <Car size={17} />
            <span>状态 {state.vehicle.status}</span>
          </div>
          <div>
            <History size={17} />
            <span>时间线 {timeline.length}</span>
          </div>
        </div>
      </section>

      <section className="priority-panel">
        <div className="section-kicker">车辆信息</div>
        <div className="priority-content">
          <div className="priority-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>{state.vehicle.brand} {state.vehicle.model}</strong>
            <p className="muted">{state.vehicle.exteriorColor} / {state.vehicle.interiorColor} · VIN {state.vehicle.vin ?? '待补充'}</p>
          </div>
        </div>
      </section>

      <Card title="车辆信息">
        <div className="detail-grid">
          <span>品牌</span><strong>{state.vehicle.brand}</strong>
          <span>车型</span><strong>{state.vehicle.model}</strong>
          <span>外观</span><strong>{state.vehicle.exteriorColor}</strong>
          <span>内饰</span><strong>{state.vehicle.interiorColor}</strong>
          <span>VIN</span><strong>{state.vehicle.vin ?? '待补充'}</strong>
        </div>
      </Card>

      <section className="content-section">
        <div className="section-header">
          <h2>文件资料</h2>
          <span>{visibleFiles.length} / {state.sourceFiles.length} 份</span>
        </div>
        <input
          className="search-input"
          value={archiveQuery}
          onChange={(event) => setArchiveQuery(event.currentTarget.value)}
          placeholder="搜索档案"
        />
        <div className="segmented archive-filter-tabs">
          {archiveFilters.map((filter) => (
            <button key={filter} className={archiveFilter === filter ? 'selected' : ''} onClick={() => setArchiveFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>
        {state.sourceFiles.length === 0 ? <p className="empty">还没有上传凭证。</p> : visibleFiles.map((file) => (
          <div className="list-item" key={file.id}>
            <FileText size={18} />
            <div>
              <strong>{file.name}</strong>
              <p>{displayPurpose(file.purpose)} · {file.createdAt.slice(0, 10)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>完整时间线</h2>
          <StatusPill label={`${timeline.length} 条`} />
        </div>
        {timeline.map((event) => (
          <div className="timeline-row" key={event.id}>
            <span>{event.date}</span>
            <div>
              <strong>{event.title}</strong>
              <p>{event.type} · {event.description}</p>
            </div>
          </div>
        ))}
      </section>

      <UploadDraftPanel title="快速导入档案资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['不确定']} />
    </div>
  );
}
