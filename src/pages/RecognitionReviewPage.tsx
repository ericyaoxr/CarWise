import { CheckCircle2, FileClock, XCircle } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import type { Page } from '../App';
import type { AppState } from '../store/appStore';
import type { RecognitionTask } from '../model/types';

interface RecognitionReviewPageProps {
  state: AppState;
  onConfirm: (id: string) => void;
  onIgnore: (id: string) => void;
  onNavigate: (page: Page) => void;
  onUpdateCandidate: (id: string, candidate: RecognitionTask['candidate']) => void;
}

const hiddenKeys = new Set(['id', 'sourceTaskId', 'confirmed']);
const numberKeys = new Set(['value', 'officialPrice', 'discountAmount', 'insuranceFee', 'purchaseTax', 'plateFee', 'subsidyTotal', 'landingPrice', 'amount', 'mileage']);

function labelFor(key: string) {
  const labels: Record<string, string> = {
    name: '名称',
    title: '标题',
    type: '类型',
    value: '金额/价值',
    spec: '规格',
    status: '状态',
    store: '门店',
    salesName: '对接人',
    quoteDate: '报价日期',
    officialPrice: '官方价',
    insuranceFee: '保险',
    subsidyTotal: '补贴合计',
    landingPrice: '落地价',
    date: '日期',
    amount: '金额',
    vendor: '商家',
    description: '描述',
    stage: '阶段',
    owner: '负责人',
    resolution: '处理方式',
    expectedDate: '预计时间',
    dueDate: '到期日期',
    dueMileage: '到期里程',
    note: '备注',
  };
  return labels[key] ?? key;
}

function displayLabel(value: string) {
  return value === '承诺' ? '权益' : value;
}

function toCandidateValue(key: string, value: string) {
  if (!numberKeys.has(key)) return value;
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function EditableCandidate({
  task,
  onUpdateCandidate,
}: {
  task: RecognitionTask;
  onUpdateCandidate: (id: string, candidate: RecognitionTask['candidate']) => void;
}) {
  const candidate = task.candidate;

  if (Array.isArray(candidate.items)) {
    const items = candidate.items as Array<Record<string, unknown>>;
    const keys = ['name', 'type', 'value', 'spec', 'owner', 'expectedDate', 'status'];

    return (
      <div className="candidate-editor">
        {items.map((item, index) => (
          <div className="candidate-row" key={index}>
            <strong>权益 {index + 1}</strong>
            {keys.filter((key) => key in item).map((key) => (
              <label key={key}>
                <span>{labelFor(key)}</span>
                <input
                  value={String(item[key] ?? '')}
                  inputMode={numberKeys.has(key) ? 'decimal' : 'text'}
                  onChange={(event) => {
                    const nextItems = items.map((row, rowIndex) => (
                      rowIndex === index ? { ...row, [key]: toCandidateValue(key, event.currentTarget.value) } : row
                    ));
                    onUpdateCandidate(task.id, { ...candidate, items: nextItems });
                  }}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="candidate-editor">
      {Object.entries(candidate).filter(([key]) => !hiddenKeys.has(key)).map(([key, value]) => (
        <label key={key}>
          <span>{labelFor(key)}</span>
          <input
            value={String(value ?? '')}
            inputMode={numberKeys.has(key) ? 'decimal' : 'text'}
            onChange={(event) => onUpdateCandidate(task.id, {
              ...candidate,
              [key]: toCandidateValue(key, event.currentTarget.value),
            })}
          />
        </label>
      ))}
    </div>
  );
}

export function RecognitionReviewPage({ state, onConfirm, onIgnore, onNavigate, onUpdateCandidate }: RecognitionReviewPageProps) {
  const pending = state.recognitionTasks.filter((item) => item.status === '待确认');

  return (
    <div className="page">
      <header className="page-title">
        <h1>识别确认</h1>
        <p>自动识别的内容不会直接入库，确认后才保存。</p>
      </header>

      {pending.length > 0 && (
        <Card title="待确认总览" className="focus-card">
          <div className="recognition-summary">
            <FileClock size={22} />
            <div>
              <strong>{pending.length} 条草稿等待确认</strong>
              <p>可以先改名称、金额、状态和备注，再确认保存到正式记录。</p>
            </div>
          </div>
        </Card>
      )}

      {pending.length === 0 ? (
        <Card>
          <div className="empty-state">
            <FileClock size={26} />
            <strong>暂无待确认草稿</strong>
            <p>可以从购车、提车、用车或档案页上传截图生成。</p>
            <ActionButton onClick={() => onNavigate('home')}>回首页</ActionButton>
          </div>
        </Card>
      ) : pending.map((task) => (
        <Card key={task.id} title={task.sourceName}>
          <p className="muted">{displayLabel(task.recognitionType)} · 建议保存到：{displayLabel(task.suggestedTarget)}</p>
          <EditableCandidate task={task} onUpdateCandidate={onUpdateCandidate} />
          {task.sourceText && (
            <div className="source-text-box">
              <strong>识别来源文字</strong>
              <pre>{task.sourceText}</pre>
            </div>
          )}
          <div className="button-row">
            <ActionButton icon={<CheckCircle2 size={16} />} variant="primary" onClick={() => onConfirm(task.id)}>确认保存</ActionButton>
            <ActionButton icon={<XCircle size={16} />} onClick={() => onIgnore(task.id)}>忽略</ActionButton>
          </div>
        </Card>
      ))}
    </div>
  );
}
