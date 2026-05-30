import { describe, expect, it } from 'vitest';

import type { AppState } from '../store/appStore';
import { inspectionInsights } from '../data/inspectionInsights';
import { createInitialState, createIssueFromChecklist, updatePromiseStatus } from '../store/appStore';
import {
  createQuietConfirmationText,
  filterChecklistItems,
  filterIssues,
  filterPromises,
  filterSourceFiles,
  getUpcomingAttention,
} from './ownerAssistant';

describe('owner assistant helpers', () => {
  it('filters benefits, checklist items, issues, and archive files for focused views', () => {
    const state = createIssueFromChecklist(createInitialState(), 'exterior-1');
    const sourceFiles: AppState['sourceFiles'] = [
      { id: 'a', name: '保险截图.md', type: '文档', purpose: '费用', createdAt: '2026-05-27T00:00:00.000Z' },
      { id: 'b', name: '权益确认.md', type: '文档', purpose: '承诺', createdAt: '2026-05-27T00:00:00.000Z' },
    ];

    expect(filterPromises(state.promises, '待处理').every((item) => item.status !== '已落实')).toBe(true);
    expect(filterChecklistItems(state.checklistItems, '有问题').every((item) => item.hasIssue)).toBe(true);
    expect(filterIssues(state.issues, '未解决')).toHaveLength(1);
    expect(filterSourceFiles(sourceFiles, '权益', '确认')).toHaveLength(1);
  });

  it('creates quiet confirmation text without sensitive wording', () => {
    const state = createInitialState();
    const text = createQuietConfirmationText(state.promises.slice(0, 2), true);

    expect(text).toContain('帮我确认');
    expect(text).toContain('事项 1');
    expect(text).not.toContain('销售');
    expect(text).not.toContain('投诉');
  });

  it('chooses the most urgent upcoming attention item', () => {
    const state = createInitialState();
    const withDonePromise = updatePromiseStatus(state, 'promise-solar-film', '已落实');
    const withIssue = {
      ...createIssueFromChecklist(withDonePromise, 'exterior-1'),
      issues: [
        {
          ...createIssueFromChecklist(withDonePromise, 'exterior-1').issues[0],
          nextReminderDate: '2026-05-28',
        },
      ],
    };

    expect(getUpcomingAttention(withIssue)).toMatchObject({
      type: '问题',
      title: withIssue.issues[0].title,
    });
  });

  it('keeps online inspection experience as actionable checklist and source cards', () => {
    const state = createInitialState();
    const ownerExperienceGroup = state.checklistGroups.find((group) => group.id === 'owner-experience');
    const ownerExperienceItems = state.checklistItems.filter((item) => item.groupId === 'owner-experience');

    expect(ownerExperienceGroup?.name).toBe('车友经验专项检查');
    expect(ownerExperienceItems.length).toBeGreaterThanOrEqual(10);
    expect(ownerExperienceItems.some((item) => item.text.includes('360'))).toBe(true);
    expect(ownerExperienceItems.some((item) => item.text.includes('App'))).toBe(true);
    expect(inspectionInsights).toHaveLength(5);
    expect(inspectionInsights.every((item) => item.sourceUrl.startsWith('https://'))).toBe(true);
  });
});
