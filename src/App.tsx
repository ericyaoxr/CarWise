import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AiConfigModal } from './components/AiConfigModal';
import { EditSheet, type EditableRecord, type EditKind } from './components/EditSheet';
import { BottomNav } from './components/BottomNav';
import { router } from './routes';
import type { RecognitionType, PromiseStatus } from './model/types';
import { recognizeImportedFile } from './utils/recognitionPipeline';
import { extractTextFromImageFile } from './utils/browserOcr';
import {
  createIssueFromChecklist,
  updatePromiseStatus,
} from './store/appStore';

import { HomePage } from './pages/HomePage';
import { PurchasePage } from './pages/PurchasePage';
import { PromisePage } from './pages/PromisePage';
import { DeliveryPage } from './pages/DeliveryPage';
import { HandoverPage } from './pages/HandoverPage';
import { IssuePage } from './pages/IssuePage';
import { UsagePage } from './pages/UsagePage';
import { ArchivePage } from './pages/ArchivePage';
import { RecognitionReviewPage } from './pages/RecognitionReviewPage';

import { useAppStore } from './store/useAppStore';

export type Page = 'home' | 'purchase' | 'promises' | 'delivery' | 'handover' | 'issue' | 'usage' | 'archive' | 'recognition';

// 实际应用主体组件
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 本地状态
  const [editor, setEditor] = useState<{ kind: EditKind; record?: unknown } | null>(null);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  
  // 单独访问每个状态，避免无限循环
  const vehicle = useAppStore((state) => state.vehicle);
  const privacyMode = useAppStore((state) => state.privacyMode);
  const quotes = useAppStore((state) => state.quotes);
  const promises = useAppStore((state) => state.promises);
  const checklistItems = useAppStore((state) => state.checklistItems);
  const checklistGroups = useAppStore((state) => state.checklistGroups);
  const sourceFiles = useAppStore((state) => state.sourceFiles);
  const issues = useAppStore((state) => state.issues);
  const expenses = useAppStore((state) => state.expenses);
  const reminders = useAppStore((state) => state.reminders);
  const recognitionTasks = useAppStore((state) => state.recognitionTasks);
  
  // 合并成一个状态对象（用于传给子组件）
  const state = useMemo(() => ({
    vehicle,
    privacyMode,
    quotes,
    promises,
    checklistItems,
    checklistGroups,
    sourceFiles,
    issues,
    expenses,
    reminders,
    recognitionTasks
  }), [vehicle, privacyMode, quotes, promises, checklistItems, checklistGroups, sourceFiles, issues, expenses, reminders, recognitionTasks]);
  
  // 直接从 store 获取 actions（稳定引用）
  const addRecognitionTask = useAppStore((state) => state.addRecognitionTask);
  const addIssuePhoto = useAppStore((state) => state.addIssuePhoto);
  const addIssueFollowUp = useAppStore((state) => state.addIssueFollowUp);
  const updateIssueStatus = useAppStore((state) => state.updateIssueStatus);
  const upsertExpense = useAppStore((state) => state.upsertExpense);
  const deleteExpense = useAppStore((state) => state.deleteExpense);
  const upsertReminder = useAppStore((state) => state.upsertReminder);
  const deleteReminder = useAppStore((state) => state.deleteReminder);
  const toggleChecklistItem = useAppStore((state) => state.toggleChecklistItem);
  const upsertQuote = useAppStore((state) => state.upsertQuote);
  const deleteQuote = useAppStore((state) => state.deleteQuote);
  const upsertPromise = useAppStore((state) => state.upsertPromise);
  const deletePromise = useAppStore((state) => state.deletePromise);
  const upsertIssue = useAppStore((state) => state.upsertIssue);
  const deleteIssue = useAppStore((state) => state.deleteIssue);
  const confirmRecognitionTask = useAppStore((state) => state.confirmRecognitionTask);
  const ignoreRecognitionTask = useAppStore((state) => state.ignoreRecognitionTask);
  const updateRecognitionTaskCandidate = useAppStore((state) => state.updateRecognitionTaskCandidate);
  const setPrivacyMode = useAppStore((state) => state.setPrivacyMode);
  const setStoreState = useAppStore((state) => state.setState);
  const updateVehicle = useAppStore((state) => state.updateVehicle);

  // 从 URL 确定当前页面
  const currentPage = useMemo((): Page => {
    const pathName = location.pathname.replace('/', '') || 'home';
    const validPages: Page[] = ['home', 'purchase', 'promises', 'delivery', 'handover', 'issue', 'usage', 'archive', 'recognition'];
    return validPages.includes(pathName as Page) ? (pathName as Page) : 'home';
  }, [location.pathname]);

  // 页面导航函数
  const handleNavigate = useCallback((page: Page) => {
    navigate(`/${page}`);
  }, [navigate]);

  const pendingFirstType = useMemo(
    () => state.recognitionTasks.find((item) => item.status === '待确认')?.recognitionType,
    [state.recognitionTasks]
  );

  const handleUpload = useCallback(async (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => {
    const extractedText = file ? await extractTextFromImageFile(file) : '';
    const tasks = await recognizeImportedFile({
      fileName: sourceName ?? `${type}截图`,
      requestedType: type,
      mimeType,
      extractedText,
      file,
    });
    tasks.forEach((task) => addRecognitionTask(task));
    handleNavigate('recognition');
  }, [addRecognitionTask, handleNavigate]);

  const handleMarkdownImport = useCallback(async (content: string, fileName: string) => {
    const tasks = await recognizeImportedFile({
      fileName,
      requestedType: '不确定',
      mimeType: fileName.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain',
      textContent: content,
    });
    tasks.forEach((task) => addRecognitionTask(task));
    handleNavigate('recognition');
  }, [addRecognitionTask, handleNavigate]);

  const handleConfirm = useCallback((taskId: string) => {
    confirmRecognitionTask(taskId);
  }, [confirmRecognitionTask]);

  const handleIgnore = useCallback((taskId: string) => {
    ignoreRecognitionTask(taskId);
  }, [ignoreRecognitionTask]);

  const handlePromiseStatus = useCallback((id: string, status: PromiseStatus) => {
    setStoreState((current) => updatePromiseStatus(current, id, status));
  }, [setStoreState]);

  const handleCreateIssue = useCallback((id: string) => {
    setStoreState((current) => createIssueFromChecklist(current, id));
    handleNavigate('issue');
  }, [setStoreState, handleNavigate]);

  const handleResolveIssue = useCallback((id: string) => {
    updateIssueStatus(id, '已解决');
  }, [updateIssueStatus]);

  const handleAddReminder = useCallback(() => {
    setEditor({ kind: 'reminder' });
  }, []);

  const handleSaveEdit = useCallback((record: EditableRecord) => {
    setEditor((editorState) => {
      if (!editorState) return null;

      if (editorState.kind === 'quote') {
        upsertQuote({ ...record, title: String(record.title || '新报价') });
      } else if (editorState.kind === 'promise') {
        upsertPromise({ ...record, name: String(record.name || '新权益') });
      } else if (editorState.kind === 'issue') {
        upsertIssue({ ...record, title: String(record.title || '新问题') });
      } else if (editorState.kind === 'expense') {
        upsertExpense({
          ...record,
          type: (record.type as never) || '其他',
          date: String(record.date || new Date().toISOString().slice(0, 10)),
        });
      } else {
        upsertReminder({ ...record, name: String(record.name || '新提醒') });
      }

      return null;
    });
  }, [upsertQuote, upsertPromise, upsertIssue, upsertExpense, upsertReminder]);

  return (
    <div className="app-shell">
      <main>
        {currentPage === 'home' && (
          <HomePage
            state={state}
            onNavigate={handleNavigate}
            onPrivacyModeChange={setPrivacyMode}
            onOpenAiConfig={() => setIsAiConfigOpen(true)}
            onUpdateVehicle={updateVehicle}
          />
        )}
        {currentPage === 'purchase' && (
          <PurchasePage
            state={state}
            onNavigate={handleNavigate}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onAddQuote={() => setEditor({ kind: 'quote' })}
            onEditQuote={(quote) => setEditor({ kind: 'quote', record: quote })}
            onDeleteQuote={deleteQuote}
          />
        )}
        {currentPage === 'promises' && (
          <PromisePage
            state={state}
            onStatusChange={handlePromiseStatus}
            onAdd={() => setEditor({ kind: 'promise' })}
            onEdit={(promise) => setEditor({ kind: 'promise', record: promise })}
            onDelete={deletePromise}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onPrivacyModeChange={setPrivacyMode}
          />
        )}
        {currentPage === 'delivery' && (
          <DeliveryPage
            state={state}
            onToggle={toggleChecklistItem}
            onCreateIssue={handleCreateIssue}
            onNavigate={handleNavigate}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
          />
        )}
        {currentPage === 'handover' && (
          <HandoverPage state={state} onNavigate={handleNavigate} />
        )}
        {currentPage === 'issue' && (
          <IssuePage
            state={state}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onResolve={handleResolveIssue}
            onAdd={() => setEditor({ kind: 'issue' })}
            onEdit={(issue) => setEditor({ kind: 'issue', record: issue })}
            onDelete={deleteIssue}
            onAddPhoto={addIssuePhoto}
            onAddFollowUp={addIssueFollowUp}
          />
        )}
        {currentPage === 'usage' && (
          <UsagePage
            state={state}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onAddReminder={handleAddReminder}
            onAddExpense={() => setEditor({ kind: 'expense' })}
            onEditExpense={(expense) => setEditor({ kind: 'expense', record: expense })}
            onDeleteExpense={deleteExpense}
            onEditReminder={(reminder) => setEditor({ kind: 'reminder', record: reminder })}
            onDeleteReminder={deleteReminder}
          />
        )}
        {currentPage === 'archive' && (
          <ArchivePage state={state} onUpload={handleUpload} onMarkdownImport={handleMarkdownImport} />
        )}
        {currentPage === 'recognition' && (
          <RecognitionReviewPage
            state={state}
            onConfirm={handleConfirm}
            onIgnore={handleIgnore}
            onNavigate={handleNavigate}
            onUpdateCandidate={updateRecognitionTaskCandidate}
          />
        )}
      </main>
      <BottomNav 
        current={currentPage} 
        onNavigate={handleNavigate} 
      />
      {editor && (
        <EditSheet 
          kind={editor.kind} 
          record={editor.record} 
          onClose={() => setEditor(null)} 
          onSave={handleSaveEdit} 
        />
      )}
      <AiConfigModal isOpen={isAiConfigOpen} onClose={() => setIsAiConfigOpen(false)} />
    </div>
  );
}

// 导出 AppContent 供路由使用
export { AppContent };

// 主 App 组件，设置路由
export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
