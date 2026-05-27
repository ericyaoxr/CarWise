import type { AppState } from '../store/appStore';
import type { ChecklistItem, Issue, Reminder, SalesPromise, SourceFile } from '../model/types';

export type PromiseFilter = '全部' | '待处理' | '已完成';
export type ChecklistFilter = '全部' | '未完成' | '有问题' | '关键项';
export type IssueFilter = '全部' | '未解决' | '快到期' | '已解决';
export type ArchiveFilter = '全部' | '权益' | '问题' | '费用' | '车辆文件' | '其他';

export interface AttentionItem {
  type: '问题' | '权益' | '提醒';
  title: string;
  date?: string;
}

const unresolvedPromiseStatuses = new Set(['未确认', '已确认', '待落实', '有争议']);
const resolvedIssueStatus = '已解决';

function displayPurpose(purpose: string) {
  if (purpose === '承诺') return '权益';
  if (purpose === '车辆文件') return '车辆文件';
  return purpose;
}

function dateValue(date?: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  const value = new Date(`${date}T00:00:00`).getTime();
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function isUpcoming(date?: string) {
  if (!date) return false;
  const target = dateValue(date);
  if (!Number.isFinite(target)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = today.getTime() + 3 * 24 * 60 * 60 * 1000;
  return target <= threeDaysLater;
}

export function filterPromises(promises: SalesPromise[], filter: PromiseFilter) {
  if (filter === '全部') return promises;
  if (filter === '已完成') return promises.filter((item) => item.status === '已落实');
  return promises.filter((item) => unresolvedPromiseStatuses.has(item.status));
}

export function filterChecklistItems(items: ChecklistItem[], filter: ChecklistFilter) {
  if (filter === '全部') return items;
  if (filter === '未完成') return items.filter((item) => !item.done);
  if (filter === '有问题') return items.filter((item) => item.hasIssue);
  return items.filter((item) => item.critical);
}

export function filterIssues(issues: Issue[], filter: IssueFilter) {
  if (filter === '全部') return issues;
  if (filter === '已解决') return issues.filter((item) => item.status === resolvedIssueStatus);
  if (filter === '快到期') {
    return issues.filter((item) => item.status !== resolvedIssueStatus && isUpcoming(item.nextReminderDate || item.expectedDate));
  }
  return issues.filter((item) => item.status !== resolvedIssueStatus);
}

export function filterSourceFiles(files: SourceFile[], filter: ArchiveFilter, query: string) {
  const keyword = query.trim().toLowerCase();
  return files.filter((file) => {
    const purpose = displayPurpose(file.purpose);
    const matchesFilter = filter === '全部' || purpose === filter;
    const haystack = `${file.name} ${purpose} ${file.type}`.toLowerCase();
    return matchesFilter && (!keyword || haystack.includes(keyword));
  });
}

export function createQuietConfirmationText(promises: SalesPromise[], privacyMode: boolean) {
  if (promises.length === 0) return '帮我确认一下，当前记录里暂时没有待确认事项。';

  const lines = promises.map((item, index) => {
    const title = privacyMode ? `事项 ${index + 1}` : item.name;
    const detail = privacyMode
      ? item.spec || item.value ? '明细已记录' : '明细待补充'
      : [item.value ? `${item.value} 元` : '', item.spec ?? ''].filter(Boolean).join('，') || '明细待补充';
    return `${title}：${detail}，当前状态 ${item.status}`;
  });

  return ['帮我确认一下，以下事项是否都按记录执行：', ...lines].join('\n');
}

function earliestIssue(issues: Issue[]) {
  return issues
    .filter((issue) => issue.status !== resolvedIssueStatus)
    .sort((left, right) => dateValue(left.nextReminderDate || left.expectedDate) - dateValue(right.nextReminderDate || right.expectedDate))[0];
}

function earliestPromise(promises: SalesPromise[]) {
  return promises
    .filter((item) => item.status !== '已落实')
    .sort((left, right) => dateValue(left.expectedDate) - dateValue(right.expectedDate))[0];
}

function earliestReminder(reminders: Reminder[]) {
  return reminders
    .filter((item) => item.status !== '已完成' && item.status !== '已忽略')
    .sort((left, right) => dateValue(left.dueDate) - dateValue(right.dueDate))[0];
}

export function getUpcomingAttention(state: AppState): AttentionItem | undefined {
  const issue = earliestIssue(state.issues);
  if (issue) return { type: '问题', title: issue.title, date: issue.nextReminderDate || issue.expectedDate };

  const promise = earliestPromise(state.promises);
  if (promise) return { type: '权益', title: promise.name, date: promise.expectedDate };

  const reminder = earliestReminder(state.reminders);
  if (reminder) return { type: '提醒', title: reminder.name, date: reminder.dueDate };

  return undefined;
}
