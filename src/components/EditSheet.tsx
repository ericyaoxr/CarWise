import { useEffect, useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';

import { ActionButton } from './ActionButton';
import type { Expense, Issue, Reminder, SalesPromise, Quote } from '../model/types';

export type EditKind = 'quote' | 'promise' | 'issue' | 'expense' | 'reminder';
export type EditableRecord = Record<string, unknown> & { id?: string };

interface EditSheetProps {
  kind: EditKind;
  record?: unknown;
  onClose: () => void;
  onSave: (record: EditableRecord) => void;
}

const titles: Record<EditKind, string> = {
  quote: '报价',
  promise: '权益记录',
  issue: '问题记录',
  expense: '费用记录',
  reminder: '提醒',
};

function defaultForm(kind: EditKind): EditableRecord {
  if (kind === 'quote') return { title: '新报价', store: '', landingPrice: undefined, subsidyTotal: undefined, status: '已确认' };
  if (kind === 'promise') return { name: '新权益', type: '赠品', status: '待落实', sourceType: '手工填写', confirmed: true };
  if (kind === 'issue') return { title: '新问题', issueType: '外观', description: '', stage: '提车当天', owner: '', expectedDate: '', nextReminderDate: '', status: '待处理', sourceType: '手工填写', confirmed: true };
  if (kind === 'expense') return { type: '充电', date: new Date().toISOString().slice(0, 10), amount: undefined, status: '已确认', sourceType: '手工填写', confirmed: true };
  return { name: '新提醒', type: '其他', status: '未开始' };
}

function numberOrUndefined(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function EditSheet({ kind, record, onClose, onSave }: EditSheetProps) {
  const initialRecord = (record ?? {}) as EditableRecord;
  const [form, setForm] = useState<EditableRecord>(() => ({ ...defaultForm(kind), ...initialRecord }));

  useEffect(() => {
    setForm({ ...defaultForm(kind), ...((record ?? {}) as EditableRecord) });
  }, [kind, record]);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const base = { ...form };

    if (kind === 'quote') {
      onSave({
        ...base,
        title: String(data.get('title') || '新报价'),
        store: String(data.get('store') || ''),
        landingPrice: numberOrUndefined(data.get('landingPrice')),
        subsidyTotal: numberOrUndefined(data.get('subsidyTotal')),
        status: '已确认',
        sourceType: '手工填写',
        confirmed: true,
      });
    }

    if (kind === 'promise') {
      onSave({
        ...base,
        name: String(data.get('name') || '新权益'),
        type: data.get('type') as SalesPromise['type'],
        value: numberOrUndefined(data.get('value')),
        spec: String(data.get('spec') || ''),
        status: data.get('status') as SalesPromise['status'],
        sourceType: '手工填写',
        confirmed: true,
      });
    }

    if (kind === 'issue') {
      onSave({
        ...base,
        title: String(data.get('title') || '新问题'),
        issueType: data.get('issueType') as Issue['issueType'],
        description: String(data.get('description') || ''),
        owner: String(data.get('owner') || ''),
        resolution: String(data.get('resolution') || ''),
        expectedDate: String(data.get('expectedDate') || ''),
        nextReminderDate: String(data.get('nextReminderDate') || ''),
        status: data.get('status') as Issue['status'],
        stage: data.get('stage') as Issue['stage'],
        sourceType: '手工填写',
        confirmed: true,
      });
    }

    if (kind === 'expense') {
      onSave({
        ...base,
        type: data.get('type') as Expense['type'],
        date: String(data.get('date') || new Date().toISOString().slice(0, 10)),
        amount: numberOrUndefined(data.get('amount')),
        vendor: String(data.get('vendor') || ''),
        description: String(data.get('description') || ''),
        status: data.get('status') as Expense['status'],
        sourceType: '手工填写',
        confirmed: true,
      });
    }

    if (kind === 'reminder') {
      onSave({
        ...base,
        name: String(data.get('name') || '新提醒'),
        type: data.get('type') as Reminder['type'],
        dueDate: String(data.get('dueDate') || ''),
        dueMileage: numberOrUndefined(data.get('dueMileage')),
        status: data.get('status') as Reminder['status'],
        note: String(data.get('note') || ''),
      });
    }
  }

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <form className="edit-sheet" onSubmit={handleSubmit}>
        <div className="sheet-header">
          <div>
            <p className="eyebrow">{form.id ? '编辑' : '新增'}</p>
            <h2>{titles[kind]}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>

        {kind === 'quote' && (
          <>
            <label>报价名称<input name="title" value={String(form.title ?? '')} onChange={(e) => setField('title', e.target.value)} /></label>
            <label>门店<input name="store" value={String(form.store ?? '')} onChange={(e) => setField('store', e.target.value)} /></label>
            <label>补贴合计<input name="subsidyTotal" inputMode="numeric" defaultValue={String(form.subsidyTotal ?? '')} /></label>
            <label>落地价<input name="landingPrice" inputMode="numeric" defaultValue={String(form.landingPrice ?? '')} /></label>
          </>
        )}

        {kind === 'promise' && (
          <>
            <label>权益名称<input name="name" value={String(form.name ?? '')} onChange={(e) => setField('name', e.target.value)} /></label>
            <label>类型<select name="type" value={String(form.type ?? '赠品')} onChange={(e) => setField('type', e.target.value)}>
              {['赠品', '补贴', '权益', '服务', '费用减免', '其他'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
            <label>金额或价值<input name="value" inputMode="numeric" defaultValue={String(form.value ?? '')} /></label>
            <label>规格说明<input name="spec" value={String(form.spec ?? '')} onChange={(e) => setField('spec', e.target.value)} /></label>
            <label>状态<select name="status" value={String(form.status ?? '待落实')} onChange={(e) => setField('status', e.target.value)}>
              {['未确认', '已确认', '待落实', '已落实', '有争议'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
          </>
        )}

        {kind === 'issue' && (
          <>
            <label>问题标题<input name="title" value={String(form.title ?? '')} onChange={(e) => setField('title', e.target.value)} /></label>
            <label>问题类型<select name="issueType" value={String(form.issueType ?? '外观')} onChange={(e) => setField('issueType', e.target.value)}>
              {['外观', '内饰', '屏幕', '权益', '交付材料', '其他'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
            <label>问题描述<textarea name="description" value={String(form.description ?? '')} onChange={(e) => setField('description', e.target.value)} /></label>
            <label>责任人<input name="owner" value={String(form.owner ?? '')} onChange={(e) => setField('owner', e.target.value)} /></label>
            <label>截止时间<input name="expectedDate" type="date" value={String(form.expectedDate ?? '')} onChange={(e) => setField('expectedDate', e.target.value)} /></label>
            <label>下次提醒<input name="nextReminderDate" type="date" value={String(form.nextReminderDate ?? '')} onChange={(e) => setField('nextReminderDate', e.target.value)} /></label>
            <label>处理方式<input name="resolution" value={String(form.resolution ?? '')} onChange={(e) => setField('resolution', e.target.value)} /></label>
            <label>阶段<select name="stage" value={String(form.stage ?? '提车当天')} onChange={(e) => setField('stage', e.target.value)}>
              {['提车前', '提车当天', '用车中'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
            <label>状态<select name="status" value={String(form.status ?? '待处理')} onChange={(e) => setField('status', e.target.value)}>
              {['待确认', '待处理', '处理中', '已解决', '有争议'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
          </>
        )}

        {kind === 'expense' && (
          <>
            <label>费用类型<select name="type" value={String(form.type ?? '充电')} onChange={(e) => setField('type', e.target.value)}>
              {['充电', '保险', '保养', '维修', '贴膜', '洗车美容', '轮胎', '上牌', '其他'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
            <label>日期<input name="date" type="date" value={String(form.date ?? '')} onChange={(e) => setField('date', e.target.value)} /></label>
            <label>金额<input name="amount" inputMode="decimal" defaultValue={String(form.amount ?? '')} /></label>
            <label>商家<input name="vendor" value={String(form.vendor ?? '')} onChange={(e) => setField('vendor', e.target.value)} /></label>
            <label>说明<input name="description" value={String(form.description ?? '')} onChange={(e) => setField('description', e.target.value)} /></label>
            <label>状态<select name="status" value={String(form.status ?? '已确认')} onChange={(e) => setField('status', e.target.value)}>
              {['草稿', '已确认', '已作废'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
          </>
        )}

        {kind === 'reminder' && (
          <>
            <label>提醒名称<input name="name" value={String(form.name ?? '')} onChange={(e) => setField('name', e.target.value)} /></label>
            <label>类型<select name="type" value={String(form.type ?? '其他')} onChange={(e) => setField('type', e.target.value)}>
              {['首保', '常规保养', '保险到期', '年检', '轮胎', '其他'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
            <label>日期<input name="dueDate" type="date" value={String(form.dueDate ?? '')} onChange={(e) => setField('dueDate', e.target.value)} /></label>
            <label>里程<input name="dueMileage" inputMode="numeric" defaultValue={String(form.dueMileage ?? '')} /></label>
            <label>备注<input name="note" value={String(form.note ?? '')} onChange={(e) => setField('note', e.target.value)} /></label>
            <label>状态<select name="status" value={String(form.status ?? '未开始')} onChange={(e) => setField('status', e.target.value)}>
              {['未开始', '即将到期', '已完成', '已忽略'].map((item) => <option key={item}>{item}</option>)}
            </select></label>
          </>
        )}

        <div className="button-row sheet-actions">
          <ActionButton icon={<Save size={16} />} type="submit" variant="primary">保存</ActionButton>
          <ActionButton type="button" onClick={onClose}>取消</ActionButton>
        </div>
      </form>
    </div>
  );
}
