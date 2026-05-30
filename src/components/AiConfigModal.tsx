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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-title">
            <Settings size={20} />
            <h3>AI 识别配置</h3>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-intro">
            <div className="flex items-start gap-2">
              <Sparkles size={20} style={{ marginTop: '2px' }} />
              <div>
                <strong>AI 驱动的智能识别</strong>
                <p>
                  配置 AI 服务后，可自动识别报价单、合同、费用票据、VIN码、轮胎出厂日期等信息。
                </p>
              </div>
            </div>
          </div>

          <div className="modal-form">
            <div className="modal-form-field">
              <label>API 提供商</label>
              <select
                value={config.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div className="modal-form-field">
              <label>API Key</label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
              />
            </div>

            <div className="modal-form-field">
              <label>API 地址</label>
              <input
                type="text"
                value={config.baseUrl || ''}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                placeholder={currentPreset?.baseUrl || 'https://api.example.com/v1'}
              />
            </div>

            <div className="modal-form-field">
              <label>模型名称</label>
              {currentPreset?.models.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <select
                    value={config.model || ''}
                    onChange={(e) => handleChange('model', e.target.value)}
                  >
                    {currentPreset.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <p style={{ 
                    margin: 0, 
                    color: 'var(--muted)', 
                    fontSize: '11px' 
                  }}>
                    或手动输入其他模型
                  </p>
                </div>
              ) : null}
              <input
                type="text"
                value={config.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder={currentPreset?.models[0] || '自定义模型'}
              />
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="advanced-toggle"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              高级设置
            </button>

            {showAdvanced && (
              <div className="advanced-options">
                <div className="modal-form-field">
                  <label>最大 Token 数</label>
                  <input
                    type="number"
                    value={config.maxTokens || DEFAULT_CONFIG.maxTokens}
                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                  />
                </div>

                <div className="modal-form-field">
                  <label>温度 (0-1)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.temperature || DEFAULT_CONFIG.temperature}
                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="modal-warning">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} style={{ marginTop: '1px' }} />
                <p>
                  配置仅保存在本地浏览器，不会上传到任何服务器。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="modal-cancel-btn"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="modal-save-btn"
          >
            {isSaving ? (
              <span>保存中...</span>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
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
