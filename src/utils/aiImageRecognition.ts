import type { AiRecognitionConfig, ImageAnalysisResult } from './aiRecognitionConfig';
import { DEFAULT_CONFIG, getConfigFromLocalStorage } from './aiRecognitionConfig';

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// OpenAI / compatible provider implementation
async function analyzeWithOpenAI(
  file: File,
  config: AiRecognitionConfig,
  imageType: string = '通用'
): Promise<ImageAnalysisResult> {
  if (!config.apiKey) {
    return { success: false, error: '未配置 API Key' };
  }

  const base64Data = await fileToBase64(file);

  const systemPrompt = `你是一个专业的汽车管理助手，负责识别和分析与汽车相关的文档和图片。
请识别图片中的所有文字内容，并进行结构化分析。

${imageType === '报价' ? `这是一张汽车报价单，请特别注意：
- 车型、配置
- 官方指导价、优惠金额
- 购置税、保险、上牌费
- 赠品（脚垫、膜、保养等）
- 落地总价` : ''}

${imageType === '合同' || imageType === '承诺' ? `这是一份购车合同或承诺，请特别注意：
- 交车时间
- 赠品和服务内容
- 价格条款
- 重要承诺` : ''}

${imageType === '费用' || imageType === '票据' ? `这是一张费用票据，请特别注意：
- 费用类型（充电、保养、维修、保险等）
- 金额
- 日期
- 收费单位` : ''}

${imageType === '问题' ? `这是一张车辆问题照片，请描述：
- 问题位置和类型
- 严重程度
- 建议措施` : ''}

${imageType === '车辆信息' || imageType === '不确定' ? `这可能是车辆相关文件或图片，请特别注意查找：
- VIN码/车架号（通常为17位字母数字组合）
- 轮胎出厂日期（通常格式如 DOT XXXX 1223，后四位1223表示2023年第12周生产）
- 车辆型号、配置信息
- 生产日期、交付日期` : ''}

请按以下格式返回JSON：
{
  "rawText": "提取的所有文字内容",
  "summary": "简洁的中文总结",
  "type": "price|contract|invoice|repair|vin|tire|other",
  "structuredData": {
    "items": [
      {"name": "项目名称", "value": "值"}
    ],
    "vin": "识别到的VIN码（如果有）",
    "tireProductionDate": "识别到的轮胎出厂日期，格式为YYYY年第WW周或YYYY-MM（如果有）",
    "tireDotCode": "完整的DOT码（如果有）"
  }
}`;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || DEFAULT_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请分析这张图片' },
              { type: 'image_url', image_url: { url: base64Data } },
            ],
          },
        ],
        max_tokens: config.maxTokens || DEFAULT_CONFIG.maxTokens,
        temperature: config.temperature || DEFAULT_CONFIG.temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    return {
      success: true,
      rawText: parsed.rawText || resultText,
      summary: parsed.summary,
      type: parsed.type || 'other',
      structuredData: parsed.structuredData || {},
    };
  } catch (error) {
    console.error('AI 识别失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '识别过程中发生未知错误',
    };
  }
}

// Fallback: browser text detection
export async function analyzeWithBrowserOcr(file: File): Promise<ImageAnalysisResult> {
  if (typeof window === 'undefined' || !window.TextDetector || typeof createImageBitmap === 'undefined') {
    return { success: false, error: '浏览器不支持 TextDetector' };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const detector = new (window as any).TextDetector();
    const results = await detector.detect(bitmap);
    bitmap.close();
    const rawText = results.map((item: any) => item.rawValue).filter(Boolean).join('\n');

    return {
      success: true,
      rawText,
      summary: '通过浏览器 OCR 提取了文字，请手动完善信息。',
      type: 'other',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OCR 识别失败',
    };
  }
}

// Main recognition function with fallback
export async function analyzeImage(
  file: File,
  imageType: string = '通用',
  customConfig?: Partial<AiRecognitionConfig>
): Promise<ImageAnalysisResult> {
  const config = { ...getConfigFromLocalStorage(), ...customConfig };

  // Try AI recognition first if configured
  if (config.apiKey) {
    try {
      const result = await analyzeWithOpenAI(file, config, imageType);
      if (result.success) {
        return result;
      }
      console.warn('AI 识别失败，回退到浏览器 OCR:', result.error);
    } catch (error) {
      console.warn('AI 识别出错，回退到浏览器 OCR:', error);
    }
  }

  // Fallback to browser OCR
  return analyzeWithBrowserOcr(file);
}
