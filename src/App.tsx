import { useEffect, useMemo, useState } from 'react';

import { BottomNav } from './components/BottomNav';
import { EditSheet, type EditableRecord, type EditKind } from './components/EditSheet';
import { ArchivePage } from './pages/ArchivePage';
import { DeliveryPage } from './pages/DeliveryPage';
import { HomePage } from './pages/HomePage';
import { IssuePage } from './pages/IssuePage';
import { PromisePage } from './pages/PromisePage';
import { PurchasePage } from './pages/PurchasePage';
import { RecognitionReviewPage } from './pages/RecognitionReviewPage';
import { UsagePage } from './pages/UsagePage';
import type { IssueStatus, PromiseStatus, RecognitionType } from './model/types';
import {
  addRecognitionTask,
  addReminder,
  confirmRecognitionTask,
  createInitialState,
  createIssueFromChecklist,
  deleteExpense,
  deleteIssue,
  deletePromise,
  deleteQuote,
  deleteReminder,
  ignoreRecognitionTask,
  loadState,
  saveState,
  setPrivacyMode,
  toggleChecklistItem,
  updateIssueStatus,
  updatePromiseStatus,
  updateRecognitionTaskCandidate,
  upsertExpense,
  upsertIssue,
  upsertPromise,
  upsertQuote,
  upsertReminder,
} from './store/appStore';
import { extractTextFromImageFile } from './utils/browserOcr';
import { recognizeImportedFile } from './utils/recognitionPipeline';

export type Page = 'home' | 'purchase' | 'promises' | 'delivery' | 'issue' | 'usage' | 'archive' | 'recognition';

const pages: Page[] = ['home', 'purchase', 'promises', 'delivery', 'issue', 'usage', 'archive', 'recognition'];

function getInitialPage(): Page {
  const requestedPage = new URLSearchParams(window.location.search).get('page');
  return pages.includes(requestedPage as Page) ? requestedPage as Page : 'home';
}

function targetPage(type: RecognitionType): Page {
  if (type === '报价' || type === '承诺') return 'purchase';
  if (type === '问题') return 'issue';
  if (type === '费用' || type === '提醒') return 'usage';
  return 'archive';
}

export default function App() {
  const [page, setPage] = useState<Page>(getInitialPage);
  const [editor, setEditor] = useState<{ kind: EditKind; record?: unknown } | null>(null);
  const [state, setState] = useState(() => {
    try {
      return loadState();
    } catch {
      return createInitialState();
    }
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const pendingFirstType = useMemo(() => state.recognitionTasks.find((item) => item.status === '待确认')?.recognitionType, [state.recognitionTasks]);

  async function handleUpload(type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) {
    const extractedText = file ? await extractTextFromImageFile(file) : '';
    const tasks = await recognizeImportedFile({
      fileName: sourceName ?? `${type}截图`,
      requestedType: type,
      mimeType,
      extractedText,
    });
    setState((current) => tasks.reduce((next, task) => addRecognitionTask(next, task), current));
    setPage('recognition');
  }

  async function handleMarkdownImport(content: string, fileName: string) {
    const tasks = await recognizeImportedFile({
      fileName,
      requestedType: '不确定',
      mimeType: fileName.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain',
      textContent: content,
    });
    setState((current) => tasks.reduce((next, task) => addRecognitionTask(next, task), current));
    setPage('recognition');
  }

  function handleConfirm(taskId: string) {
    const task = state.recognitionTasks.find((item) => item.id === taskId);
    setState((current) => confirmRecognitionTask(current, taskId));
    setPage(targetPage(task?.recognitionType ?? pendingFirstType ?? '不确定'));
  }

  function handleIgnore(taskId: string) {
    setState((current) => ignoreRecognitionTask(current, taskId));
  }

  function handlePromiseStatus(id: string, status: PromiseStatus) {
    setState((current) => updatePromiseStatus(current, id, status));
  }

  function handleCreateIssue(id: string) {
    setState((current) => createIssueFromChecklist(current, id));
    setPage('issue');
  }

  function handleResolveIssue(id: string) {
    setState((current) => updateIssueStatus(current, id, '已解决' as IssueStatus));
  }

  function handleAddReminder() {
    setEditor({ kind: 'reminder' });
  }

  function handleSaveEdit(record: EditableRecord) {
    if (!editor) return;

    setState((current) => {
      if (editor.kind === 'quote') return upsertQuote(current, { ...record, title: String(record.title || '新报价') });
      if (editor.kind === 'promise') return upsertPromise(current, { ...record, name: String(record.name || '新权益') });
      if (editor.kind === 'issue') return upsertIssue(current, { ...record, title: String(record.title || '新问题') });
      if (editor.kind === 'expense') return upsertExpense(current, { ...record, type: (record.type as never) || '其他', date: String(record.date || new Date().toISOString().slice(0, 10)) });
      return upsertReminder(current, { ...record, name: String(record.name || '新提醒') });
    });
    setEditor(null);
  }

  return (
    <div className="app-shell">
      <main>
        {page === 'home' && (
          <HomePage
            state={state}
            onNavigate={setPage}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onPrivacyModeChange={(privacyMode) => setState((current) => setPrivacyMode(current, privacyMode))}
          />
        )}
        {page === 'purchase' && (
          <PurchasePage
            state={state}
            onNavigate={setPage}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onAddQuote={() => setEditor({ kind: 'quote' })}
            onEditQuote={(quote) => setEditor({ kind: 'quote', record: quote })}
            onDeleteQuote={(id) => setState((current) => deleteQuote(current, id))}
          />
        )}
        {page === 'promises' && (
          <PromisePage
            state={state}
            onStatusChange={handlePromiseStatus}
            onAdd={() => setEditor({ kind: 'promise' })}
            onEdit={(promise) => setEditor({ kind: 'promise', record: promise })}
            onDelete={(id) => setState((current) => deletePromise(current, id))}
            onPrivacyModeChange={(privacyMode) => setState((current) => setPrivacyMode(current, privacyMode))}
          />
        )}
        {page === 'delivery' && (
          <DeliveryPage
            state={state}
            onToggle={(id) => setState((current) => toggleChecklistItem(current, id))}
            onCreateIssue={handleCreateIssue}
          />
        )}
        {page === 'issue' && (
          <IssuePage
            state={state}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onResolve={handleResolveIssue}
            onAdd={() => setEditor({ kind: 'issue' })}
            onEdit={(issue) => setEditor({ kind: 'issue', record: issue })}
            onDelete={(id) => setState((current) => deleteIssue(current, id))}
          />
        )}
        {page === 'usage' && (
          <UsagePage
            state={state}
            onUpload={handleUpload}
            onMarkdownImport={handleMarkdownImport}
            onAddReminder={handleAddReminder}
            onAddExpense={() => setEditor({ kind: 'expense' })}
            onEditExpense={(expense) => setEditor({ kind: 'expense', record: expense })}
            onDeleteExpense={(id) => setState((current) => deleteExpense(current, id))}
            onEditReminder={(reminder) => setEditor({ kind: 'reminder', record: reminder })}
            onDeleteReminder={(id) => setState((current) => deleteReminder(current, id))}
          />
        )}
        {page === 'archive' && <ArchivePage state={state} onUpload={handleUpload} onMarkdownImport={handleMarkdownImport} />}
        {page === 'recognition' && (
          <RecognitionReviewPage
            state={state}
            onConfirm={handleConfirm}
            onIgnore={handleIgnore}
            onNavigate={setPage}
            onUpdateCandidate={(taskId, candidate) => setState((current) => updateRecognitionTaskCandidate(current, taskId, candidate))}
          />
        )}
      </main>
      <BottomNav current={page} onNavigate={setPage} />
      {editor && <EditSheet kind={editor.kind} record={editor.record} onClose={() => setEditor(null)} onSave={handleSaveEdit} />}
    </div>
  );
}
