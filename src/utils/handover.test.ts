import { describe, expect, it } from 'vitest';

import { createInitialState, createIssueFromChecklist, updatePromiseStatus } from '../store/appStore';
import { summarizeHandoverReadiness } from './handover';

describe('handover readiness summary', () => {
  it('collects unfinished checklist items, open benefits, and unresolved issues before signing', () => {
    const state = createInitialState();
    const target = state.checklistItems.find((item) => item.critical);
    expect(target).toBeTruthy();

    const withIssue = createIssueFromChecklist(state, target!.id);
    const withPromiseDone = updatePromiseStatus(withIssue, 'promise-solar-film', '已落实');
    const summary = summarizeHandoverReadiness(withPromiseDone);

    expect(summary.blocked).toBe(true);
    expect(summary.unfinishedCriticalItems.length).toBeGreaterThan(0);
    expect(summary.openPromises.some((item) => item.id === 'promise-solar-film')).toBe(false);
    expect(summary.openIssues).toHaveLength(1);
  });
});
