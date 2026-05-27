import type { AppState } from '../store/appStore';

export function summarizeHandoverReadiness(state: AppState) {
  const unfinishedCriticalItems = state.checklistItems.filter((item) => item.critical && !item.done);
  const openPromises = state.promises.filter((item) => item.status === '未确认' || item.status === '待落实' || item.status === '有争议');
  const openIssues = state.issues.filter((item) => item.status !== '已解决');

  return {
    unfinishedCriticalItems,
    openPromises,
    openIssues,
    blocked: unfinishedCriticalItems.length > 0 || openPromises.length > 0 || openIssues.length > 0,
  };
}
