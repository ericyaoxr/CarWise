import { checklistGroups, checklistItems } from '../data/checklist';
import { defaultPromises, defaultReminders, defaultVehicle } from '../data/defaults';
import type {
  ChecklistGroup,
  ChecklistItem,
  Expense,
  Issue,
  IssueStatus,
  IssueType,
  LandingCostItem,
  PromiseStatus,
  Quote,
  RecognitionTask,
  Reminder,
  SalesPromise,
  SourceFile,
  Vehicle,
  VehicleStatus,
} from '../model/types';

export interface AppState {
  privacyMode: boolean;
  vehicle: Vehicle;
  quotes: Quote[];
  promises: SalesPromise[];
  checklistGroups: ChecklistGroup[];
  checklistItems: ChecklistItem[];
  issues: Issue[];
  expenses: Expense[];
  reminders: Reminder[];
  recognitionTasks: RecognitionTask[];
  sourceFiles: SourceFile[];
  landingCostItems: LandingCostItem[];
}

const STORAGE_KEY = 'carwise:mvp:v1';

function id(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createInitialState(): AppState {
  return {
    privacyMode: true,
    vehicle: { ...defaultVehicle },
    quotes: [],
    promises: defaultPromises.map((item) => ({ ...item })),
    checklistGroups: checklistGroups.map((item) => ({ ...item })),
    checklistItems: checklistItems.map((item) => ({ ...item })),
    issues: [],
    expenses: [],
    reminders: defaultReminders.map((item) => ({ ...item })),
    recognitionTasks: [],
    sourceFiles: [],
    landingCostItems: [],
  };
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function byId<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function issueTypeForGroup(groupId: string): IssueType {
  if (groupId === 'exterior') return '外观';
  if (groupId === 'interior' || groupId === 'comfort') return '内饰';
  if (groupId === 'infotainment') return '屏幕';
  if (groupId === 'promises' || groupId === 'accessories') return '权益';
  if (['sign-before-pay', 'docs', 'core-info', 'final-sign'].includes(groupId)) return '交付材料';
  return '其他';
}

function normalizePromiseStatus(status: unknown): PromiseStatus {
  const value = String(status ?? '');
  const validStatuses: PromiseStatus[] = ['未确认', '已确认', '待落实', '已落实', '有争议'];
  return validStatuses.includes(value as PromiseStatus) 
    ? value as PromiseStatus 
    : '待落实';
}

function normalizeState(parsed: Partial<AppState>): AppState {
  const initial = createInitialState();
  const parsedGroups = byId(parsed.checklistGroups ?? []);
  const parsedItems = byId(parsed.checklistItems ?? []);
  const parsedPromises = byId(parsed.promises ?? []);

  return {
    ...initial,
    ...parsed,
    vehicle: { ...initial.vehicle, ...parsed.vehicle },
    promises: [
      ...initial.promises.map((item) => {
        const saved = parsedPromises.get(item.id);
        return saved ? { ...item, ...saved, name: item.name, type: item.type, spec: item.spec, status: normalizePromiseStatus(saved.status) } : item;
      }),
      ...(parsed.promises ?? []).filter((item) => !initial.promises.some((preset) => preset.id === item.id)).map((item) => ({
        ...item,
        status: normalizePromiseStatus(item.status),
      })),
    ],
    checklistGroups: initial.checklistGroups.map((item) => {
      const saved = parsedGroups.get(item.id);
      return saved ? { ...item, critical: saved.critical ?? item.critical } : item;
    }),
    checklistItems: initial.checklistItems.map((item) => {
      const saved = parsedItems.get(item.id);
      return saved ? { ...item, done: Boolean(saved.done), hasIssue: Boolean(saved.hasIssue) } : item;
    }),
    reminders: parsed.reminders ?? initial.reminders,
    recognitionTasks: parsed.recognitionTasks ?? initial.recognitionTasks,
    sourceFiles: parsed.sourceFiles ?? initial.sourceFiles,
    quotes: parsed.quotes ?? initial.quotes,
    issues: (parsed.issues ?? initial.issues).map((item) => ({
      ...item,
      issueType: item.issueType ?? '其他',
      nextReminderDate: item.nextReminderDate ?? '',
      photos: item.photos ?? [],
      followUps: item.followUps ?? [],
    })),
    expenses: parsed.expenses ?? initial.expenses,
    landingCostItems: parsed.landingCostItems ?? initial.landingCostItems,
  };
}

export function loadState(storage: StorageLike | undefined = typeof localStorage === 'undefined' ? undefined : localStorage): AppState {
  if (!storage) return createInitialState();

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();

  try {
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return normalizeState(parsed);
  } catch {
    storage.removeItem(STORAGE_KEY);
    return createInitialState();
  }
}

export function saveState(state: AppState, storage: StorageLike | undefined = typeof localStorage === 'undefined' ? undefined : localStorage) {
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateVehicleStatus(state: AppState, status: VehicleStatus): AppState {
  return { ...state, vehicle: { ...state.vehicle, status } };
}

export function setPrivacyMode(state: AppState, privacyMode: boolean): AppState {
  return { ...state, privacyMode };
}

export function addRecognitionTask(state: AppState, task: RecognitionTask): AppState {
  return {
    ...state,
    recognitionTasks: [task, ...state.recognitionTasks],
    sourceFiles: [
      {
        id: task.sourceId ?? id('source'),
        name: task.sourceName,
        type: task.sourceType === '文件识别' ? '文档' : '截图',
        purpose:
          task.recognitionType === '车辆信息'
            ? '车辆文件'
            : task.recognitionType === '不确定' || task.recognitionType === '提醒'
              ? '其他'
              : task.recognitionType,
        createdAt: task.createdAt,
      },
      ...state.sourceFiles,
    ],
  };
}

function markTask(state: AppState, taskId: string, status: RecognitionTask['status']) {
  return {
    ...state,
    recognitionTasks: state.recognitionTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
  };
}

export function ignoreRecognitionTask(state: AppState, taskId: string): AppState {
  return markTask(state, taskId, '已忽略');
}

export function updateRecognitionTaskCandidate(state: AppState, taskId: string, candidate: RecognitionTask['candidate']): AppState {
  return {
    ...state,
    recognitionTasks: state.recognitionTasks.map((task) => (task.id === taskId ? { ...task, candidate } : task)),
  };
}

export function confirmRecognitionTask(state: AppState, taskId: string): AppState {
  const task = state.recognitionTasks.find((item) => item.id === taskId);
  if (!task) return state;

  let next = markTask(state, taskId, '已确认');
  const candidate = task.candidate;

  if (task.recognitionType === '承诺') {
    const items = Array.isArray(candidate.items) ? candidate.items : [candidate];
    const promises = items.map((item) => {
      const row = item as Partial<SalesPromise>;
      return {
        id: id('promise'),
        name: String(row.name ?? '待确认权益'),
        type: (row.type as SalesPromise['type']) ?? '其他',
        value: typeof row.value === 'number' ? row.value : undefined,
        spec: typeof row.spec === 'string' ? row.spec : undefined,
        status: (row.status as PromiseStatus) ?? '待落实',
        sourceType: task.sourceType,
        sourceTaskId: task.id,
        confirmed: true,
      };
    });
    next = { ...next, promises: [...promises, ...next.promises] };
  }

  if (task.recognitionType === '报价') {
    const quote: Quote = {
      id: id('quote'),
      title: String(candidate.title ?? '识别出的报价'),
      store: typeof candidate.store === 'string' ? candidate.store : undefined,
      salesName: typeof candidate.salesName === 'string' ? candidate.salesName : undefined,
      quoteDate: typeof candidate.quoteDate === 'string' ? candidate.quoteDate : undefined,
      officialPrice: typeof candidate.officialPrice === 'number' ? candidate.officialPrice : undefined,
      insuranceFee: typeof candidate.insuranceFee === 'number' ? candidate.insuranceFee : undefined,
      subsidyTotal: typeof candidate.subsidyTotal === 'number' ? candidate.subsidyTotal : undefined,
      landingPrice: typeof candidate.landingPrice === 'number' ? candidate.landingPrice : undefined,
      status: '已确认',
      sourceType: task.sourceType,
      sourceTaskId: task.id,
      confirmed: true,
    };
    next = { ...next, quotes: [quote, ...next.quotes] };
  }

  if (task.recognitionType === '费用') {
    const expense: Expense = {
      id: id('expense'),
      type: (candidate.type as Expense['type']) ?? '其他',
      date: String(candidate.date ?? new Date().toISOString().slice(0, 10)),
      amount: typeof candidate.amount === 'number' ? candidate.amount : undefined,
      vendor: typeof candidate.vendor === 'string' ? candidate.vendor : undefined,
      description: typeof candidate.description === 'string' ? candidate.description : undefined,
      status: '已确认',
      sourceType: task.sourceType,
      sourceTaskId: task.id,
      confirmed: true,
    };
    next = { ...next, expenses: [expense, ...next.expenses] };
  }

  if (task.recognitionType === '问题') {
    const issue: Issue = {
      id: id('issue'),
      title: String(candidate.title ?? '待处理问题'),
      issueType: (candidate.issueType as IssueType) ?? '其他',
      description: String(candidate.description ?? '由照片识别生成，等待确认'),
      stage: (candidate.stage as Issue['stage']) ?? '提车当天',
      owner: typeof candidate.owner === 'string' ? candidate.owner : undefined,
      resolution: typeof candidate.resolution === 'string' ? candidate.resolution : undefined,
      expectedDate: typeof candidate.expectedDate === 'string' ? candidate.expectedDate : '',
      nextReminderDate: typeof candidate.nextReminderDate === 'string' ? candidate.nextReminderDate : '',
      photos: [],
      followUps: [],
      status: (candidate.status as IssueStatus) ?? '待处理',
      sourceType: task.sourceType,
      sourceTaskId: task.id,
      confirmed: true,
    };
    next = { ...next, issues: [issue, ...next.issues] };
  }

  if (task.recognitionType === '提醒') {
    const reminder: Reminder = {
      id: id('reminder'),
      name: String(candidate.name ?? '新提醒'),
      type: (candidate.type as Reminder['type']) ?? '其他',
      dueDate: typeof candidate.dueDate === 'string' ? candidate.dueDate : undefined,
      dueMileage: typeof candidate.dueMileage === 'number' ? candidate.dueMileage : undefined,
      status: (candidate.status as Reminder['status']) ?? '未开始',
      note: typeof candidate.note === 'string' ? candidate.note : undefined,
    };
    next = { ...next, reminders: [reminder, ...next.reminders] };
  }

  return next;
}

export function updatePromiseStatus(state: AppState, idValue: string, status: PromiseStatus): AppState {
  return {
    ...state,
    promises: state.promises.map((item) => (item.id === idValue ? { ...item, status } : item)),
  };
}

export function upsertQuote(state: AppState, quote: Partial<Quote> & Pick<Quote, 'title'>): AppState {
  const next: Quote = {
    id: quote.id ?? id('quote'),
    title: quote.title,
    store: quote.store,
    salesName: quote.salesName,
    quoteDate: quote.quoteDate,
    officialPrice: quote.officialPrice,
    discountAmount: quote.discountAmount,
    insuranceFee: quote.insuranceFee,
    purchaseTax: quote.purchaseTax,
    plateFee: quote.plateFee,
    subsidyTotal: quote.subsidyTotal,
    landingPrice: quote.landingPrice,
    status: quote.status ?? '已确认',
    sourceType: quote.sourceType ?? '手工填写',
    sourceTaskId: quote.sourceTaskId,
    confirmed: quote.confirmed ?? true,
  };
  const exists = state.quotes.some((item) => item.id === next.id);
  return { ...state, quotes: exists ? state.quotes.map((item) => (item.id === next.id ? next : item)) : [next, ...state.quotes] };
}

export function deleteQuote(state: AppState, idValue: string): AppState {
  return { ...state, quotes: state.quotes.filter((item) => item.id !== idValue) };
}

export function upsertPromise(state: AppState, promise: Partial<SalesPromise> & Pick<SalesPromise, 'name'>): AppState {
  const next: SalesPromise = {
    id: promise.id ?? id('promise'),
    name: promise.name,
    type: promise.type ?? '其他',
    value: promise.value,
    spec: promise.spec,
    owner: promise.owner,
    expectedDate: promise.expectedDate,
    actualDate: promise.actualDate,
    status: promise.status ?? '待落实',
    evidence: promise.evidence,
    sourceType: promise.sourceType ?? '手工填写',
    sourceTaskId: promise.sourceTaskId,
    confirmed: promise.confirmed ?? true,
  };
  const exists = state.promises.some((item) => item.id === next.id);
  return { ...state, promises: exists ? state.promises.map((item) => (item.id === next.id ? next : item)) : [next, ...state.promises] };
}

export function deletePromise(state: AppState, idValue: string): AppState {
  return { ...state, promises: state.promises.filter((item) => item.id !== idValue) };
}

export function toggleChecklistItem(state: AppState, idValue: string): AppState {
  return {
    ...state,
    checklistItems: state.checklistItems.map((item) => (item.id === idValue ? { ...item, done: !item.done } : item)),
  };
}

export function createIssueFromChecklist(state: AppState, itemId: string): AppState {
  const item = state.checklistItems.find((row) => row.id === itemId);
  if (!item) return state;

  const issue: Issue = {
    id: id('issue'),
    title: item.text,
    issueType: issueTypeForGroup(item.groupId),
    description: `检查项「${item.text}」发现异常，需要拍照留证并让交付人员确认。`,
    stage: '提车当天',
    checklistItemId: item.id,
    owner: '交付人员',
    resolution: '交付前确认处理方式和完成时间',
    expectedDate: '',
    nextReminderDate: '',
    photos: [],
    followUps: [],
    status: '待处理',
    sourceType: '手工填写',
    confirmed: true,
  };

  return {
    ...state,
    checklistItems: state.checklistItems.map((row) => (row.id === itemId ? { ...row, hasIssue: true } : row)),
    issues: [issue, ...state.issues],
  };
}

export function updateIssueStatus(state: AppState, idValue: string, status: IssueStatus): AppState {
  return {
    ...state,
    issues: state.issues.map((item) => (item.id === idValue ? { ...item, status } : item)),
  };
}

export function upsertIssue(state: AppState, issue: Partial<Issue> & Pick<Issue, 'title'>): AppState {
  const next: Issue = {
    id: issue.id ?? id('issue'),
    title: issue.title,
    issueType: issue.issueType ?? '其他',
    description: issue.description ?? '待补充问题描述',
    stage: issue.stage ?? '提车当天',
    checklistItemId: issue.checklistItemId,
    owner: issue.owner,
    resolution: issue.resolution,
    expectedDate: issue.expectedDate,
    nextReminderDate: issue.nextReminderDate ?? '',
    resolvedDate: issue.resolvedDate,
    photos: issue.photos ?? [],
    followUps: issue.followUps ?? [],
    status: issue.status ?? '待处理',
    sourceType: issue.sourceType ?? '手工填写',
    sourceTaskId: issue.sourceTaskId,
    confirmed: issue.confirmed ?? true,
  };
  const exists = state.issues.some((item) => item.id === next.id);
  return { ...state, issues: exists ? state.issues.map((item) => (item.id === next.id ? next : item)) : [next, ...state.issues] };
}

export function deleteIssue(state: AppState, idValue: string): AppState {
  return { ...state, issues: state.issues.filter((item) => item.id !== idValue) };
}

export function addIssuePhoto(state: AppState, issueId: string, photo: { name: string; dataUrl: string }): AppState {
  return {
    ...state,
    issues: state.issues.map((issue) => (
      issue.id === issueId
        ? {
            ...issue,
            photos: [
              ...(issue.photos ?? []),
              { id: id('photo'), name: photo.name, dataUrl: photo.dataUrl, createdAt: new Date().toISOString() },
            ],
          }
        : issue
    )),
  };
}

export function addIssueFollowUp(state: AppState, issueId: string, content: string): AppState {
  const text = content.trim();
  if (!text) return state;

  return {
    ...state,
    issues: state.issues.map((issue) => (
      issue.id === issueId
        ? {
            ...issue,
            followUps: [
              ...(issue.followUps ?? []),
              { id: id('followup'), content: text, createdAt: new Date().toISOString() },
            ],
          }
        : issue
    )),
  };
}

export function updateIssueReminder(state: AppState, issueId: string, nextReminderDate: string): AppState {
  return {
    ...state,
    issues: state.issues.map((issue) => (issue.id === issueId ? { ...issue, nextReminderDate } : issue)),
  };
}

export function addExpense(state: AppState, expense: Omit<Expense, 'id' | 'sourceType' | 'confirmed'>): AppState {
  return {
    ...state,
    expenses: [{ ...expense, id: id('expense'), sourceType: '手工填写', confirmed: true }, ...state.expenses],
  };
}

export function upsertExpense(state: AppState, expense: Partial<Expense> & Pick<Expense, 'type' | 'date'>): AppState {
  const next: Expense = {
    id: expense.id ?? id('expense'),
    type: expense.type,
    date: expense.date,
    amount: expense.amount,
    mileage: expense.mileage,
    vendor: expense.vendor,
    description: expense.description,
    status: expense.status ?? '已确认',
    sourceType: expense.sourceType ?? '手工填写',
    sourceTaskId: expense.sourceTaskId,
    confirmed: expense.confirmed ?? true,
  };
  const exists = state.expenses.some((item) => item.id === next.id);
  return { ...state, expenses: exists ? state.expenses.map((item) => (item.id === next.id ? next : item)) : [next, ...state.expenses] };
}

export function deleteExpense(state: AppState, idValue: string): AppState {
  return { ...state, expenses: state.expenses.filter((item) => item.id !== idValue) };
}

export function addReminder(state: AppState, reminder: Omit<Reminder, 'id'>): AppState {
  return {
    ...state,
    reminders: [{ ...reminder, id: id('reminder') }, ...state.reminders],
  };
}

export function upsertReminder(state: AppState, reminder: Partial<Reminder> & Pick<Reminder, 'name'>): AppState {
  const next: Reminder = {
    id: reminder.id ?? id('reminder'),
    name: reminder.name,
    type: reminder.type ?? '其他',
    dueDate: reminder.dueDate,
    dueMileage: reminder.dueMileage,
    status: reminder.status ?? '未开始',
    note: reminder.note,
  };
  const exists = state.reminders.some((item) => item.id === next.id);
  return { ...state, reminders: exists ? state.reminders.map((item) => (item.id === next.id ? next : item)) : [next, ...state.reminders] };
}

export function deleteReminder(state: AppState, idValue: string): AppState {
  return { ...state, reminders: state.reminders.filter((item) => item.id !== idValue) };
}

export function upsertLandingCostItem(state: AppState, item: Partial<LandingCostItem> & Pick<LandingCostItem, 'category' | 'name' | 'amount'>): AppState {
  const next: LandingCostItem = {
    id: item.id ?? id('landingcost'),
    category: item.category,
    name: item.name,
    amount: item.amount,
    date: item.date,
    vendor: item.vendor,
    description: item.description,
    photoDataUrl: item.photoDataUrl,
    sourceType: item.sourceType ?? '手工填写',
    sourceTaskId: item.sourceTaskId,
    confirmed: item.confirmed ?? true,
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
  const exists = state.landingCostItems.some((existingItem) => existingItem.id === next.id);
  return { 
    ...state, 
    landingCostItems: exists 
      ? state.landingCostItems.map((existingItem) => (existingItem.id === next.id ? next : existingItem))
      : [next, ...state.landingCostItems]
  };
}

export function deleteLandingCostItem(state: AppState, idValue: string): AppState {
  return { ...state, landingCostItems: state.landingCostItems.filter((item) => item.id !== idValue) };
}

export function getLandingCostSummary(state: AppState): {
  total: number;
  byCategory: Map<string, number>;
  itemCount: number;
} {
  const byCategory = new Map<string, number>();
  let total = 0;
  
  state.landingCostItems.forEach((item) => {
    const current = byCategory.get(item.category) ?? 0;
    byCategory.set(item.category, current + item.amount);
    total += item.amount;
  });
  
  return { total, byCategory, itemCount: state.landingCostItems.length };
}
