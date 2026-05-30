import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState } from './appStore';
import {
  createInitialState,
  loadState,
  saveState,
  addRecognitionTask,
  updateRecognitionTaskCandidate,
  confirmRecognitionTask,
  ignoreRecognitionTask,
  setPrivacyMode,
  addIssuePhoto,
  addIssueFollowUp,
  updateIssueStatus,
  upsertExpense,
  deleteExpense,
  upsertReminder,
  deleteReminder,
  toggleChecklistItem,
  upsertQuote,
  deleteQuote,
  upsertPromise,
  deletePromise,
  upsertIssue,
  deleteIssue,
} from './appStore';

interface AppStateActions {
  setState: (state: AppState | ((prev: AppState) => AppState)) => void;
  addRecognitionTask: (task: Parameters<typeof addRecognitionTask>[1]) => void;
  updateRecognitionTaskCandidate: (taskId: string, candidate: Record<string, unknown>) => void;
  confirmRecognitionTask: (taskId: string) => void;
  ignoreRecognitionTask: (taskId: string) => void;
  setPrivacyMode: (enabled: boolean) => void;
  addIssuePhoto: (issueId: string, photo: { name: string; dataUrl: string }) => void;
  addIssueFollowUp: (issueId: string, content: string) => void;
  updateIssueStatus: (issueId: string, status: string) => void;
  upsertExpense: (expense: unknown) => void;
  deleteExpense: (id: string) => void;
  upsertReminder: (reminder: unknown) => void;
  deleteReminder: (id: string) => void;
  toggleChecklistItem: (id: string) => void;
  upsertQuote: (quote: unknown) => void;
  deleteQuote: (id: string) => void;
  upsertPromise: (promise: unknown) => void;
  deletePromise: (id: string) => void;
  upsertIssue: (issue: unknown) => void;
  deleteIssue: (id: string) => void;
  updateVehicle: (updates: Partial<AppState['vehicle']>) => void;
  exportData: () => string;
  importData: (data: string) => void;
}

export type AppStore = AppState & AppStateActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      
      setState: (newState) => {
        set(newState);
      },

      addRecognitionTask: (task) => {
        set((state) => addRecognitionTask(state, task));
      },

      updateRecognitionTaskCandidate: (taskId, candidate) => {
        set((state) => updateRecognitionTaskCandidate(state, taskId, candidate));
      },

      confirmRecognitionTask: (taskId) => {
        set((state) => confirmRecognitionTask(state, taskId));
      },

      ignoreRecognitionTask: (taskId) => {
        set((state) => ignoreRecognitionTask(state, taskId));
      },

      setPrivacyMode: (enabled) => {
        set((state) => setPrivacyMode(state, enabled));
      },

      addIssuePhoto: (issueId, photo) => {
        set((state) => addIssuePhoto(state, issueId, photo));
      },

      addIssueFollowUp: (issueId, content) => {
        set((state) => addIssueFollowUp(state, issueId, content));
      },

      updateIssueStatus: (issueId, status) => {
        set((state) => updateIssueStatus(state, issueId, status as any));
      },

      upsertExpense: (expense) => {
        set((state) => upsertExpense(state, expense as any));
      },

      deleteExpense: (id) => {
        set((state) => deleteExpense(state, id));
      },

      upsertReminder: (reminder) => {
        set((state) => upsertReminder(state, reminder as any));
      },

      deleteReminder: (id) => {
        set((state) => deleteReminder(state, id));
      },

      toggleChecklistItem: (id) => {
        set((state) => toggleChecklistItem(state, id));
      },

      upsertQuote: (quote) => {
        set((state) => upsertQuote(state, quote as any));
      },

      deleteQuote: (id) => {
        set((state) => deleteQuote(state, id));
      },

      upsertPromise: (promise) => {
        set((state) => upsertPromise(state, promise as any));
      },

      deletePromise: (id) => {
        set((state) => deletePromise(state, id));
      },

      upsertIssue: (issue) => {
        set((state) => upsertIssue(state, issue as any));
      },

      deleteIssue: (id) => {
        set((state) => deleteIssue(state, id));
      },

      updateVehicle: (updates) => {
        set((state) => ({
          ...state,
          vehicle: {
            ...state.vehicle,
            ...updates,
          },
        }));
      },

      exportData: () => {
        const state = get();
        return JSON.stringify(state, null, 2);
      },

      importData: (data) => {
        const parsed = JSON.parse(data) as AppState;
        set(parsed);
      },
    }),
    {
      name: 'carwise-app-state',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: unknown) => {
        if (!persistedState) {
          return createInitialState();
        }
        // 检查是否有需要迁移的数据结构
        const state = persistedState as Record<string, unknown>;
        if (!state.vehicle) {
          return createInitialState();
        }
        return persistedState as unknown as AppState;
      },
    }
  )
);

// 初始化：如果 localStorage 有数据，使用它；否则创建初始数据
useAppStore.persist.rehydrate();
