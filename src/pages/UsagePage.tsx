import { Bell, Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react';

import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { StatusPill } from '../components/StatusPill';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { Expense, RecognitionType, Reminder } from '../model/types';
import type { AppState } from '../store/appStore';

interface UsagePageProps {
  state: AppState;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onAddReminder: () => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

export function UsagePage({
  state,
  onUpload,
  onMarkdownImport,
  onAddReminder,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onEditReminder,
  onDeleteReminder,
}: UsagePageProps) {
  const pendingCosts = state.recognitionTasks.filter((item) => item.status === '待确认' && item.recognitionType === '费用');
  const totalExpense = state.expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const activeReminders = state.reminders.filter((item) => item.status !== '已完成' && item.status !== '已忽略');
  const nextReminder = activeReminders[0];

  return (
    <div className="page advisor-page">
      <header className="advisor-title">
        <span className="section-kicker">用车管家</span>
        <h1>用车</h1>
        <p>费用、保养和保险提醒集中记录，票据和截图先识别成草稿再确认。</p>
      </header>

      <section className="equity-overview">
        <div>
          <span className="section-kicker">用车总览</span>
          <strong>{totalExpense.toLocaleString()}</strong>
          <p>费用合计（元） · {activeReminders.length} 个提醒进行中</p>
        </div>
        <div className="overview-actions">
          <div>
            <Bell size={17} />
            <span>提醒 {activeReminders.length}</span>
          </div>
          <div>
            <ReceiptText size={17} />
            <span>待确认票据 {pendingCosts.length}</span>
          </div>
        </div>
        <div className="button-row compact-action-row">
          <ActionButton icon={<Plus size={16} />} onClick={onAddExpense} variant="primary">新增费用</ActionButton>
          <ActionButton icon={<Plus size={16} />} onClick={onAddReminder}>新增提醒</ActionButton>
        </div>
      </section>

      <section className="priority-panel">
        <div className="section-kicker">下一次提醒</div>
        <div className="priority-content">
          <div className="priority-icon">
            <Bell size={22} />
          </div>
          <div>
            <strong>{nextReminder?.name ?? '暂无进行中提醒'}</strong>
            <p className="muted">{nextReminder ? `${nextReminder.dueDate ?? `${nextReminder.dueMileage ?? '-'} 公里`} · ${nextReminder.note ?? '备注待补充'}` : '提车后可添加保养、保险、轮胎和年检提醒。'}</p>
          </div>
        </div>
      </section>

      {pendingCosts.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2>待确认费用草稿</h2>
            <span>{pendingCosts.length} 项</span>
          </div>
          {pendingCosts.map((item) => (
            <div className="list-item" key={item.id}>
              <ReceiptText size={18} />
              <div>
                <strong>{item.sourceName}</strong>
                <p>{item.status}</p>
              </div>
              <StatusPill label={item.status} />
            </div>
          ))}
        </section>
      )}

      <section className="content-section">
        <div className="section-header">
          <h2>费用记录</h2>
          <ActionButton icon={<Plus size={16} />} onClick={onAddExpense}>新增</ActionButton>
        </div>
        {state.expenses.length === 0 ? <p className="empty">还没有费用记录。</p> : state.expenses.map((expense) => (
          <div className="list-item" key={expense.id}>
            <ReceiptText size={18} />
            <div>
              <strong>{expense.type} · {expense.amount ?? '-'} 元</strong>
              <p>{expense.date} · {expense.vendor ?? '商家待确认'}</p>
              <p>{expense.description}</p>
            </div>
            <StatusPill label={expense.status} />
            <div className="mini-actions vertical">
              <button onClick={() => onEditExpense(expense)}><Pencil size={14} />编辑</button>
              <button onClick={() => onDeleteExpense(expense.id)}><Trash2 size={14} />删除</button>
            </div>
          </div>
        ))}
      </section>

      <Card title="保养和保险提醒" action={<ActionButton icon={<Plus size={16} />} onClick={onAddReminder}>新增提醒</ActionButton>}>
        {state.reminders.map((reminder) => (
          <div className="list-item" key={reminder.id}>
            <Bell size={18} />
            <div>
              <strong>{reminder.name}</strong>
              <p>{reminder.dueDate ?? `${reminder.dueMileage ?? '-'} 公里`} · {reminder.note}</p>
            </div>
            <StatusPill label={reminder.status} />
            <div className="mini-actions vertical">
              <button onClick={() => onEditReminder(reminder)}><Pencil size={14} />编辑</button>
              <button onClick={() => onDeleteReminder(reminder.id)}><Trash2 size={14} />删除</button>
            </div>
          </div>
        ))}
      </Card>

      <UploadDraftPanel title="快速导入用车资料（可选）" onUpload={onUpload} onMarkdownImport={onMarkdownImport} compact types={['费用', '提醒']} />
    </div>
  );
}
