import { describe, expect, it } from 'vitest';
import {
  addReminder,
  addIssueFollowUp,
  addIssuePhoto,
  deleteExpense,
  deletePromise,
  deleteReminder,
  confirmRecognitionTask,
  createInitialState,
  createIssueFromChecklist,
  ignoreRecognitionTask,
  loadState,
  saveState,
  upsertExpense,
  upsertPromise,
  upsertReminder,
  updateIssueReminder,
  toggleChecklistItem,
  setPrivacyMode,
  updateRecognitionTaskCandidate,
  updatePromiseStatus,
} from './appStore';
import { createMockRecognitionTask } from '../utils/recognition';
import { deriveTimeline } from '../utils/timeline';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe('CarWise app state', () => {
  it('starts with one 007GT, default promises, reminders, and checklist data', () => {
    const state = createInitialState();

    expect(state.vehicle.model).toBe('007GT');
    expect(state.vehicle.status).toBe('待提车');
    expect(state.promises.some((item) => item.name.includes('太阳膜'))).toBe(true);
    expect(state.reminders.some((item) => item.name.includes('首保'))).toBe(true);
    expect(state.checklistGroups).toHaveLength(10);
    expect(state.checklistItems.length).toBeGreaterThan(100);
    expect(state.privacyMode).toBe(true);
  });

  it('can turn the low-profile display mode on and off and persist it', () => {
    const storage = memoryStorage();
    const visible = setPrivacyMode(createInitialState(), false);

    expect(visible.privacyMode).toBe(false);

    saveState(visible, storage);
    expect(loadState(storage).privacyMode).toBe(false);
  });

  it('keeps recognized promise drafts separate until the owner confirms them', () => {
    const state = createInitialState();
    const task = createMockRecognitionTask('承诺');
    const withDraft = { ...state, recognitionTasks: [task] };

    expect(withDraft.promises.some((item) => item.sourceTaskId === task.id)).toBe(false);

    const confirmed = confirmRecognitionTask(withDraft, task.id);

    expect(confirmed.recognitionTasks[0].status).toBe('已确认');
    expect(confirmed.promises.some((item) => item.name.includes('8000 极氪积分'))).toBe(true);
    expect(confirmed.promises.some((item) => item.sourceTaskId === task.id)).toBe(true);
  });

  it('can ignore a recognition draft without creating formal records', () => {
    const state = createInitialState();
    const task = createMockRecognitionTask('费用');
    const ignored = ignoreRecognitionTask({ ...state, recognitionTasks: [task] }, task.id);

    expect(ignored.recognitionTasks[0].status).toBe('已忽略');
    expect(ignored.expenses.some((item) => item.sourceTaskId === task.id)).toBe(false);
  });

  it('confirms the edited recognition draft instead of the original candidate', () => {
    const state = createInitialState();
    const task = createMockRecognitionTask('报价');
    const withDraft = { ...state, recognitionTasks: [task] };

    const edited = updateRecognitionTaskCandidate(withDraft, task.id, {
      ...task.candidate,
      landingPrice: 198800,
      salesName: '小王',
    });
    const confirmed = confirmRecognitionTask(edited, task.id);

    expect(confirmed.recognitionTasks[0].candidate.landingPrice).toBe(198800);
    expect(confirmed.quotes[0].landingPrice).toBe(198800);
    expect(confirmed.quotes[0].salesName).toBe('小王');
  });

  it('can confirm recognized expenses and show them on the timeline', () => {
    const state = createInitialState();
    const task = createMockRecognitionTask('费用');
    const confirmed = confirmRecognitionTask({ ...state, recognitionTasks: [task] }, task.id);
    const timeline = deriveTimeline(confirmed);

    expect(confirmed.expenses.some((item) => item.description?.includes('贴膜'))).toBe(true);
    expect(timeline.some((event) => event.title.includes('贴膜'))).toBe(true);
  });

  it('turns checklist issues into unresolved to-dos', () => {
    const state = createInitialState();
    const target = state.checklistItems.find((item) => item.text.includes('轮毂无剐蹭'));
    expect(target).toBeTruthy();

    const withDone = toggleChecklistItem(state, target!.id);
    const withIssue = createIssueFromChecklist(withDone, target!.id);

    expect(withIssue.checklistItems.find((item) => item.id === target!.id)?.hasIssue).toBe(true);
    expect(withIssue.issues.some((issue) => issue.checklistItemId === target!.id)).toBe(true);
    expect(withIssue.issues.some((issue) => issue.status === '待处理')).toBe(true);
  });

  it('creates checklist issues as follow-up records with type, owner, and deadline fields', () => {
    const state = createInitialState();
    const target = state.checklistItems.find((item) => item.groupId === 'exterior' && item.text.includes('轮毂'));
    expect(target).toBeTruthy();

    const withIssue = createIssueFromChecklist(state, target!.id);
    const issue = withIssue.issues.find((item) => item.checklistItemId === target!.id);

    expect(issue?.issueType).toBe('外观');
    expect(issue?.owner).toBe('交付人员');
    expect(issue?.expectedDate).toBe('');
    expect(issue?.resolution).toContain('处理方式');
  });

  it('keeps issue photos, follow-up notes, and next reminder date with the issue', () => {
    const state = createInitialState();
    const target = state.checklistItems.find((item) => item.groupId === 'exterior');
    expect(target).toBeTruthy();

    const withIssue = createIssueFromChecklist(state, target!.id);
    const issue = withIssue.issues[0];
    const withPhoto = addIssuePhoto(withIssue, issue.id, {
      name: '轮毂照片.jpg',
      dataUrl: 'data:image/jpeg;base64,abc',
    });
    const withFollowUp = addIssueFollowUp(withPhoto, issue.id, '已和交付人员确认，等待处理方案。');
    const withReminder = updateIssueReminder(withFollowUp, issue.id, '2026-05-30');
    const updatedIssue = withReminder.issues.find((item) => item.id === issue.id);

    expect(updatedIssue?.photos).toHaveLength(1);
    expect(updatedIssue?.photos?.[0].name).toBe('轮毂照片.jpg');
    expect(updatedIssue?.followUps).toHaveLength(1);
    expect(updatedIssue?.followUps?.[0].content).toContain('等待处理方案');
    expect(updatedIssue?.nextReminderDate).toBe('2026-05-30');
  });

  it('persists changes in local storage', () => {
    const storage = memoryStorage();
    const state = updatePromiseStatus(createInitialState(), 'promise-solar-film', '已落实');
    const reminded = addReminder(state, {
      name: '保险到期提醒',
      type: '保险到期',
      dueDate: '2027-05-25',
      status: '未开始',
      note: '提车后确认保单日期',
    });

    saveState(reminded, storage);
    const loaded = loadState(storage);

    expect(loaded.promises.find((item) => item.id === 'promise-solar-film')?.status).toBe('已落实');
    expect(loaded.reminders.some((item) => item.name === '保险到期提醒')).toBe(true);
  });

  it('refreshes old saved checklist wording while keeping owner progress', () => {
    const storage = memoryStorage();
    const oldState = createInitialState();
    const oldChecklist = oldState.checklistItems.map((item) =>
      item.id === 'sign-before-pay-4'
        ? { ...item, text: '如需后续处理，销售或交付员已微信文字确认处理方式和时间', done: true, hasIssue: true }
        : item,
    );

    saveState({ ...oldState, checklistItems: oldChecklist }, storage);
    const loaded = loadState(storage);
    const migrated = loaded.checklistItems.find((item) => item.id === 'sign-before-pay-4');

    expect(migrated?.text).toBe('如需后续处理，已记录处理方式和时间');
    expect(migrated?.done).toBe(true);
    expect(migrated?.hasIssue).toBe(true);
  });

  it('can add, edit, and delete promises', () => {
    const state = createInitialState();
    const added = upsertPromise(state, {
      name: '临时赠品',
      type: '赠品',
      status: '待落实',
      sourceType: '手工填写',
      confirmed: true,
    });
    const created = added.promises.find((item) => item.name === '临时赠品');

    expect(created).toBeTruthy();

    const edited = upsertPromise(added, { ...created!, name: '已修改赠品', status: '已落实' });
    expect(edited.promises.some((item) => item.name === '已修改赠品' && item.status === '已落实')).toBe(true);

    const removed = deletePromise(edited, created!.id);
    expect(removed.promises.some((item) => item.id === created!.id)).toBe(false);
  });

  it('can add, edit, and delete expenses and reminders', () => {
    const state = createInitialState();
    const withExpense = upsertExpense(state, {
      type: '充电',
      date: '2026-05-26',
      amount: 88,
      vendor: '快充站',
      description: '第一次充电',
      status: '已确认',
      sourceType: '手工填写',
      confirmed: true,
    });
    const expense = withExpense.expenses.find((item) => item.description === '第一次充电');

    expect(expense).toBeTruthy();
    expect(upsertExpense(withExpense, { ...expense!, amount: 99 }).expenses.find((item) => item.id === expense!.id)?.amount).toBe(99);
    expect(deleteExpense(withExpense, expense!.id).expenses.some((item) => item.id === expense!.id)).toBe(false);

    const withReminder = upsertReminder(state, {
      name: '轮胎检查',
      type: '轮胎',
      dueMileage: 10000,
      status: '未开始',
    });
    const reminder = withReminder.reminders.find((item) => item.name === '轮胎检查');

    expect(reminder).toBeTruthy();
    expect(upsertReminder(withReminder, { ...reminder!, status: '已完成' }).reminders.find((item) => item.id === reminder!.id)?.status).toBe('已完成');
    expect(deleteReminder(withReminder, reminder!.id).reminders.some((item) => item.id === reminder!.id)).toBe(false);
  });
});
