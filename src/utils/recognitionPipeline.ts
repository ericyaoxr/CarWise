import type { RecognitionTask, RecognitionType, SourceType } from '../model/types';
import { parseMarkdownToRecognitionTasks } from './markdownImport';
import { createMockRecognitionTask } from './recognition';

interface RecognitionFileInput {
  fileName: string;
  requestedType: RecognitionType;
  mimeType?: string;
  textContent?: string;
  extractedText?: string;
}

function isMarkdownFile(input: RecognitionFileInput) {
  const name = input.fileName.toLowerCase();
  return Boolean(input.textContent) && (
    name.endsWith('.md') ||
    name.endsWith('.markdown') ||
    input.mimeType === 'text/markdown' ||
    input.mimeType === 'text/plain'
  );
}

function sourceTypeFor(input: RecognitionFileInput): SourceType {
  if (input.requestedType === '问题') return '图片识别';
  if (input.requestedType === '不确定' || input.requestedType === '车辆信息') return '文件识别';
  if (input.mimeType?.startsWith('image/')) return '截图识别';
  return '文件识别';
}

function aiImageSummary(input: RecognitionFileInput) {
  const kind = input.requestedType === '问题' ? '问题照片' : input.requestedType === '费用' ? '票据截图' : '资料截图';
  return `AI识图已读取${kind}「${input.fileName}」，先生成可编辑草稿；请补充或修正金额、责任人、时间等关键字段。`;
}

export async function recognizeImportedFile(input: RecognitionFileInput): Promise<RecognitionTask[]> {
  if (isMarkdownFile(input)) {
    const sourceText = input.textContent?.trim();
    return parseMarkdownToRecognitionTasks(input.textContent ?? '', input.fileName).map((task) => ({
      ...task,
      sourceText,
    }));
  }

  if (input.extractedText?.trim()) {
    const sourceText = input.extractedText.trim();
    return parseMarkdownToRecognitionTasks(input.extractedText, input.fileName).map((task) => ({
      ...task,
      sourceType: sourceTypeFor(input),
      sourceText,
    }));
  }

  const task = createMockRecognitionTask(input.requestedType, input.fileName);
  const summary = input.mimeType?.startsWith('image/') ? aiImageSummary(input) : undefined;
  return [{
    ...task,
    sourceName: input.fileName,
    sourceType: sourceTypeFor(input),
    sourceText: summary,
    candidate: {
      ...task.candidate,
      ...(summary ? { aiSummary: summary } : {}),
    },
  }];
}
