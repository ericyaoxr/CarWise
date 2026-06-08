import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, FileText } from 'lucide-react';
import type { LandingCostItem } from '../model/types';

interface LandingCostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<LandingCostItem> & Pick<LandingCostItem, 'category' | 'name' | 'amount'>) => void;
  editingItem?: LandingCostItem | null;
}

export function LandingCostEditor({ isOpen, onClose, onSave, editingItem }: LandingCostEditorProps) {
  const [form, setForm] = useState({
    category: '裸车价' as LandingCostItem['category'],
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    description: '',
    photoDataUrl: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        category: editingItem.category,
        name: editingItem.name,
        amount: String(editingItem.amount),
        date: editingItem.date || new Date().toISOString().split('T')[0],
        vendor: editingItem.vendor || '',
        description: editingItem.description || '',
        photoDataUrl: editingItem.photoDataUrl || '',
      });
    } else {
      setForm({
        category: '裸车价',
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        description: '',
        photoDataUrl: '',
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.name || isNaN(amount)) {
      return;
    }
    
    onSave({
      id: editingItem?.id,
      category: form.category,
      name: form.name,
      amount: amount,
      date: form.date,
      vendor: form.vendor,
      description: form.description,
      photoDataUrl: form.photoDataUrl,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm(prev => ({
          ...prev,
          photoDataUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setForm(prev => ({
      ...prev,
      photoDataUrl: '',
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? '编辑费用' : '新增费用'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-field">
            <label>费用分类 *</label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as any }))}
              required
            >
              <option value="裸车价">裸车价</option>
              <option value="购置税">购置税</option>
              <option value="保险费">保险费</option>
              <option value="上牌费">上牌费</option>
              <option value="服务费">服务费</option>
              <option value="装潢费">装潢费</option>
              <option value="其他费用">其他费用</option>
            </select>
          </div>

          <div className="form-field">
            <label>费用名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例如：交强险、上牌服务费等"
              required
            />
          </div>

          <div className="form-field">
            <label>金额 (元) *</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-field">
            <label>日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label>收款方</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
              placeholder="例如：4S店、保险公司等"
            />
          </div>

          <div className="form-field">
            <label>备注说明</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="添加备注说明"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label>账单照片</label>
            {form.photoDataUrl ? (
              <div className="photo-preview">
                <img src={form.photoDataUrl} alt="账单照片" />
                <button type="button" className="remove-photo" onClick={removePhoto}>
                  <Trash2 size={16} /> 移除
                </button>
              </div>
            ) : (
              <div className="photo-upload">
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={20} />
                  <span>上传账单照片</span>
                </button>
                <p style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '13px' }}>
                  可以上传发票、收据等凭证照片
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="primary-button">
              {editingItem ? '保存修改' : '新增费用'}
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 16px;
          }

          .modal-content {
            background: var(--bg);
            border-radius: 16px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 20px;
            border-bottom: 1px solid var(--line);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }

          .close-button {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border: 0;
            background: transparent;
            color: var(--muted);
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: var(--surface);
            color: var(--text);
          }

          .modal-body {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
          }

          .form-field {
            margin-bottom: 16px;
          }

          .form-field label {
            display: block;
            margin-bottom: 6px;
            color: var(--text);
            font-size: 13px;
            font-weight: 600;
          }

          .form-field input,
          .form-field select,
          .form-field textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--surface);
            color: var(--text);
            font-size: 14px;
            transition: all 0.2s;
          }

          .form-field input:focus,
          .form-field select:focus,
          .form-field textarea:focus {
            outline: none;
            border-color: var(--brand);
            box-shadow: 0 0 0 3px var(--brand-soft);
          }

          .form-field textarea {
            resize: vertical;
            min-height: 80px;
          }

          .photo-preview {
            position: relative;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid var(--line);
          }

          .photo-preview img {
            width: 100%;
            max-height: 200px;
            object-fit: cover;
          }

          .remove-photo {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            background: var(--danger-soft);
            color: var(--danger);
            border: 1px solid var(--danger-line);
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .remove-photo:hover {
            background: var(--danger);
            color: white;
          }

          .photo-upload button {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 32px;
            border: 2px dashed var(--line);
            border-radius: 10px;
            background: var(--surface);
            color: var(--muted);
            cursor: pointer;
            transition: all 0.2s;
          }

          .photo-upload button:hover {
            border-color: var(--brand);
            background: var(--brand-soft);
            color: var(--brand);
          }

          .modal-footer {
            display: flex;
            gap: 10px;
            padding: 16px 20px;
            border-top: 1px solid var(--line);
            justify-content: flex-end;
          }

          .secondary-button,
          .primary-button {
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .secondary-button {
            background: var(--surface);
            border: 1px solid var(--line);
            color: var(--text);
          }

          .secondary-button:hover {
            background: var(--surface-soft);
          }

          .primary-button {
            background: var(--brand);
            border: 1px solid var(--brand);
            color: white;
          }

          .primary-button:hover {
            background: var(--brand-strong);
          }
        `}</style>
      </div>
    </div>
  );
}
