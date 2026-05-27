import { useRef, useState } from 'react';
import { Camera, FileText, ImageUp } from 'lucide-react';

import { ActionButton } from './ActionButton';
import type { RecognitionType } from '../model/types';

interface UploadDraftPanelProps {
  title?: string;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  compact?: boolean;
  types?: RecognitionType[];
}

export function UploadDraftPanel({ title = '截图 / 文档导入后自动生成草稿', onUpload, onMarkdownImport, compact = false, types }: UploadDraftPanelProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<RecognitionType>('报价');

  const items: Array<{ type: RecognitionType; label: string; sourceName: string }> = [
    { type: '报价', label: '上传截图识别报价', sourceName: '报价截图' },
    { type: '承诺', label: '上传截图识别权益', sourceName: '沟通截图' },
    { type: '问题', label: '上传照片识别问题', sourceName: '问题照片' },
    { type: '费用', label: '上传票据识别费用', sourceName: '票据截图' },
    { type: '提醒', label: '上传文件识别提醒', sourceName: '保单截图' },
    { type: '不确定', label: '上传文件识别档案', sourceName: '档案文件' },
  ];
  const availableItems = types ? items.filter((item) => types.includes(item.type)) : items;

  function chooseImage(type: RecognitionType) {
    setPendingType(type);
    imageInputRef.current?.click();
  }

  function handleImageFile(file?: File) {
    if (!file) return;
    onUpload(pendingType, file.name, file.type, file);
  }

  async function handleMarkdownFile(file?: File) {
    if (!file) return;
    const content = await file.text();
    onMarkdownImport(content, file.name);
  }

  return (
    <div className={`upload-panel ${compact ? 'compact' : ''}`}>
      <div>
        <p className="eyebrow">{title}</p>
        <p className="muted">点下方按钮选择截图、照片或 .md 文档；AI识图结果先进入待确认。</p>
      </div>
      <div className="upload-actions">
        {availableItems.map((item, index) => (
          <ActionButton
            key={item.type}
            icon={item.type === '问题' ? <Camera size={16} /> : <ImageUp size={16} />}
            onClick={() => chooseImage(item.type)}
            variant={index === 0 ? 'primary' : 'secondary'}
          >
            {item.label}
          </ActionButton>
        ))}
        <ActionButton icon={<FileText size={16} />} onClick={() => markdownInputRef.current?.click()} variant="primary">
          导入 MD 文档识别
        </ActionButton>
      </div>
      <input
        aria-label="选择截图或照片"
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.heic"
        onChange={(event) => handleImageFile(event.currentTarget.files?.[0])}
      />
      <input
        aria-label="选择 MD 文档"
        ref={markdownInputRef}
        hidden
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        onChange={(event) => handleMarkdownFile(event.currentTarget.files?.[0])}
      />
    </div>
  );
}
