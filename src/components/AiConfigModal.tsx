import React, { useState, useEffect } from 'react';
import { Settings, X, Check, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { AiRecognitionConfig } from '../utils/aiRecognitionConfig';
import { getConfigFromLocalStorage, saveConfigToLocalStorage, DEFAULT_CONFIG } from '../utils/aiRecognitionConfig';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderPreset {
  name: string;
  baseUrl: string;
  models: string[];
}

const PROVIDER_PRESETS: Record<string, ProviderPreset> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4']
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder']
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  custom: {
    name: '自定义',
    baseUrl: '',
    models: []
  }
};

export function AiConfigModal({ isOpen, onClose }: AiConfigModalProps): React.ReactElement | null {
  const [config, setConfig] = useState<AiRecognitionConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getConfigFromLocalStorage());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    saveConfigToLocalStorage(config);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
    }, 300);
  };

  const handleChange = (field: keyof AiRecognitionConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider as keyof typeof PROVIDER_PRESETS];
    if (preset) {
      setConfig(prev => ({
        ...prev,
        provider: provider as any,
        baseUrl: preset.baseUrl || prev.baseUrl,
        model: preset.models[0] || prev.model
      }));
    }
  };

  if (!isOpen) return null;

  const currentPreset = PROVIDER_PRESETS[config.provider || 'openai'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 识别配置</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-purple-900 dark:text-purple-100 font-medium">AI 驱动的智能识别</p>
              <p className="text-purple-700 dark:text-purple-300 mt-1">
                配置 AI 服务后，可自动识别报价单、合同、费用票据、VIN码、轮胎出厂日期等信息。
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API 提供商
              </label>
              <select
                value={config.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API 地址
              </label>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                placeholder={currentPreset?.baseUrl || 'https://api.example.com/v1'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                模型名称
              </label>
              {currentPreset?.models.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={config.model || ''}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {currentPreset.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    或手动输入其他模型
                  </p>
                </div>
              ) : null}
              <input
                type="text"
                value={config.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder={currentPreset?.models[0] || '自定义模型'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              高级设置
            </button>

            {showAdvanced && (
              <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    最大 Token 数
                  </label>
                  <input
                    type="number"
                    value={config.maxTokens || DEFAULT_CONFIG.maxTokens}
                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    温度 (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.temperature || DEFAULT_CONFIG.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                配置仅保存在本地浏览器，不会上传到任何服务器。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <span>保存中...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>已保存</span>
              </>
            ) : (
              <span>保存配置</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
