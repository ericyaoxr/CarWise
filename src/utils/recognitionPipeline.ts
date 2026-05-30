import type { RecognitionTask, RecognitionType, SourceType } from '../model/types';
import { parseMarkdownToRecognitionTasks } from './markdownImport';
import { createMockRecognitionTask } from './recognition';
import { analyzeImage } from './aiImageRecognition';
import type { ImageAnalysisResult } from './aiRecognitionConfig';

interface RecognitionFileInput {
  fileName: string;
  requestedType: RecognitionType;
  mimeType?: string;
  textContent?: string;
  extractedText?: string;
  file?: File;
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

function aiImageSummary(input: RecognitionFileInput, aiResult?: ImageAnalysisResult) {
  if (aiResult?.success && aiResult.summary) {
    return aiResult.summary;
  }
  const kind = input.requestedType === '问题' ? '问题照片' : input.requestedType === '费用' ? '票据截图' : '资料截图';
  return `AI识图已读取${kind}「${input.fileName}」，先生成可编辑草稿；请补充或修正金额、责任人、时间等关键字段。`;
}

// Apply AI structured data to candidate
function applyStructuredData(
  candidate: Record<string, unknown>,
  aiResult: ImageAnalysisResult,
  requestedType: RecognitionType
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...candidate, aiSummary: aiResult.summary };

  // Apply VIN and tire date if available
  if (aiResult.structuredData) {
    const data = aiResult.structuredData as Record<string, unknown>;
    if (data.vin) {
      result.vin = data.vin;
    }
    if (data.tireProductionDate) {
      result.tireProductionDate = data.tireProductionDate;
    }
    if (data.tireDotCode) {
      result.tireDotCode = data.tireDotCode;
    }
  }

  if (aiResult.structuredData?.items) {
    const items = aiResult.structuredData.items as Array<{ name: string; value: string }>;
    
    items.forEach(({ name, value }) => {
      const lowerName = name.toLowerCase();
      
      // Common fields
      if (lowerName.includes('金额') || lowerName.includes('总价') || lowerName.includes('price')) {
        if (!result.amount) result.amount = value;
      }
      if (lowerName.includes('日期') || lowerName.includes('时间') || lowerName.includes('date')) {
        if (!result.date) result.date = value;
      }
      if (lowerName.includes('备注') || lowerName.includes('说明') || lowerName.includes('note')) {
        if (!result.notes) result.notes = value;
      }
      
      // Type-specific fields
      if (requestedType === '报价') {
        if (lowerName.includes('车型') || lowerName.includes('model')) {
          if (!result.title) result.title = value;
        }
      } else if (requestedType === '问题') {
        if (lowerName.includes('问题') || lowerName.includes('描述') || lowerName.includes('issue')) {
          if (!result.title) result.title = value;
        }
      } else if (requestedType === '费用') {
        if (lowerName.includes('类型') || lowerName.includes('项目') || lowerName.includes('type')) {
          if (!result.expenseType) result.expenseType = value;
        }
      }
    });
  }

  return result;
}

export async function recognizeImportedFile(input: RecognitionFileInput): Promise<RecognitionTask[]> {
  if (isMarkdownFile(input)) {
    const sourceText = input.textContent?.trim();
    return parseMarkdownToRecognitionTasks(input.textContent ?? '', input.fileName).map((task) => ({
      ...task,
      sourceText,
    }));
  }

  let aiResult: ImageAnalysisResult | undefined;

  // Try AI recognition if file is provided
  if (input.file && input.mimeType?.startsWith('image/')) {
    try {
      const result = await analyzeImage(input.file, input.requestedType);
      aiResult = result;
      
      if (result.success && result.rawText) {
        // Use AI-extracted text
        const sourceText = result.rawText;
        const tasks = parseMarkdownToRecognitionTasks(result.rawText, input.fileName).map((task) => ({
          ...task,
          sourceType: sourceTypeFor(input),
          sourceText: result.summary || result.rawText,
          candidate: applyStructuredData(task.candidate, result, input.requestedType),
        }));
        
        if (tasks.length > 0) {
          return tasks;
        }
      }
    } catch (error) {
      console.warn('AI 识别流程出错:', error);
      // Continue with fallback
    }
  }

  // Fallback to extracted text
  if (input.extractedText?.trim()) {
    const sourceText = input.extractedText.trim();
    return parseMarkdownToRecognitionTasks(input.extractedText, input.fileName).map((task) => ({
      ...task,
      sourceType: sourceTypeFor(input),
      sourceText,
    }));
  }

  // Final fallback: mock task
  const task = createMockRecognitionTask(input.requestedType, input.fileName);
  const summary = aiImageSummary(input, aiResult);
  let candidate: Record<string, unknown> = { ...task.candidate };
  
  if (summary) {
    candidate.aiSummary = summary;
  }
  
  if (aiResult?.structuredData) {
    candidate = { ...candidate, ...applyStructuredData({}, aiResult, input.requestedType) };
  }
  
  return [{
    ...task,
    sourceName: input.fileName,
    sourceType: sourceTypeFor(input),
    sourceText: summary,
    candidate,
  }];
}
