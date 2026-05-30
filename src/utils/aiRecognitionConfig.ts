export interface AiRecognitionConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  provider?: 'openai' | 'anthropic' | 'deepseek' | 'custom';
}

export interface ImageAnalysisResult {
  success: boolean;
  rawText?: string;
  structuredData?: Record<string, unknown>;
  summary?: string;
  type?: 'price' | 'contract' | 'invoice' | 'repair' | 'other';
  error?: string;
}

export const DEFAULT_CONFIG: AiRecognitionConfig = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  maxTokens: 2048,
  temperature: 0.3,
};

export function getConfigFromLocalStorage(): AiRecognitionConfig {
  try {
    const saved = localStorage.getItem('carwise_ai_config');
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_CONFIG;
}

export function saveConfigToLocalStorage(config: Partial<AiRecognitionConfig>): void {
  const current = getConfigFromLocalStorage();
  localStorage.setItem('carwise_ai_config', JSON.stringify({ ...current, ...config }));
}
