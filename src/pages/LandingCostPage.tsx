import { Plus, Receipt, Pencil, Trash2, Upload, FileText, DollarSign, PieChart } from 'lucide-react';
import React, { useState } from 'react';

import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { UploadDraftPanel } from '../components/UploadDraftPanel';
import type { LandingCostItem, RecognitionType } from '../model/types';
import type { AppState } from '../store/appStore';

interface LandingCostPageProps {
  state: AppState;
  onUpload: (type: RecognitionType, sourceName?: string, mimeType?: string, file?: File) => void;
  onMarkdownImport: (content: string, fileName: string) => void;
  onAddCost: () => void;
  onEditCost: (cost: LandingCostItem) => void;
  onDeleteCost: (id: string) => void;
}

export function LandingCostPage({
  state,
  onUpload,
  onMarkdownImport,
  onAddCost,
  onEditCost,
  onDeleteCost,
}: LandingCostPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: '全部' },
    { key: '裸车价', label: '裸车价' },
    { key: '购置税', label: '购置税' },
    { key: '保险费', label: '保险费' },
    { key: '上牌费', label: '上牌费' },
    { key: '服务费', label: '服务费' },
    { key: '装潢费', label: '装潢费' },
    { key: '其他费用', label: '其他费用' },
  ];

  const totalAmount = state.landingCostItems.reduce((sum, item) => sum + item.amount, 0);
  const byCategory = categories
    .filter(cat => cat.key !== 'all')
    .reduce((acc, cat) => {
      const total = state.landingCostItems
        .filter(item => item.category === cat.key)
        .reduce((sum, item) => sum + item.amount, 0);
      if (total > 0) {
        acc.set(cat.key, total);
      }
      return acc;
    }, new Map<string, number>());

  const filteredItems = selectedCategory === 'all'
    ? state.landingCostItems
    : state.landingCostItems.filter(item => item.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="page landing-cost-page">
      <header className="advisor-title">
        <span className="section-kicker">落地价格</span>
        <h1>购车落地价格管理</h1>
        <p>记录和管理购车过程中的所有费用，包括账单上传和费用统计。</p>
      </header>

      <section className="equity-overview">
        <div>
          <span className="section-kicker">落地总价</span>
          <strong>{totalAmount.toLocaleString()}</strong>
          <p>元 · 共 {state.landingCostItems.length} 项费用</p>
        </div>
        <div className="overview-actions">
          <div>
            <PieChart size={17} />
            <span>分类统计 {byCategory.size}</span>
          </div>
          <div>
            <FileText size={17} />
            <span>票据数 {state.landingCostItems.filter(item => item.photoDataUrl).length}</span>
          </div>
        </div>
        <div className="button-row compact-action-row">
          <ActionButton icon={<Plus size={16} />} onClick={onAddCost} variant="primary">新增费用</ActionButton>
        </div>
      </section>

      <section className="priority-panel">
        <div className="section-kicker">快速分类统计</div>
        <div className="priority-content">
          <div className="priority-icon">
            <DollarSign size={22} />
          </div>
          <div>
            {byCategory.size > 0 ? (
              <div>
                {Array.from(byCategory.entries()).map(([category, amount]) => (
                  <div key={category} style={{ marginBottom: '4px' }}>
                    <strong>{category}:</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text)' }}>
                      {amount.toLocaleString()} 元
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <strong>暂无费用记录</strong>
                <p className="muted">开始添加费用项目来查看分类统计。</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>费用明细</h2>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--surface)' }}
          >
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {sortedItems.length === 0 ? (
          <p className="empty">还没有费用记录。</p>
        ) : (
          sortedItems.map((item) => (
            <div className="list-item" key={item.id}>
              <Receipt size={18} />
              <div style={{ flex: 1 }}>
                <strong>{item.category} · {item.name}</strong>
                <p>
                  {item.date && `${item.date} · `}
                  {item.vendor || '商家待确认'}
                </p>
                {item.description && <p>{item.description}</p>}
              </div>
              <div style={{ textAlign: 'right', marginRight: '12px' }}>
                <strong style={{ color: 'var(--brand)', fontSize: '16px' }}>
                  {item.amount.toLocaleString()} 元
                </strong>
              </div>
              <div className="mini-actions vertical">
                {item.photoDataUrl && <FileText size={14} style={{ color: 'var(--muted)' }} />}
                <button onClick={() => onEditCost(item)}><Pencil size={14} />编辑</button>
                <button onClick={() => onDeleteCost(item.id)}><Trash2 size={14} />删除</button>
              </div>
            </div>
          ))
        )}
      </section>

      <Card title="账单上传" action={<ActionButton icon={<Upload size={16} />} onClick={() => onUpload('车辆信息')}>上传票据</ActionButton>}>
        <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>
          上传购车相关的账单、发票和票据，可以通过 AI 识别自动创建费用记录。
        </p>
        <UploadDraftPanel 
          title="快速导入账单（可选）" 
          onUpload={onUpload} 
          onMarkdownImport={onMarkdownImport} 
          compact 
          types={['费用', '车辆信息']} 
        />
      </Card>

      <style>{`
        .landing-cost-page .equity-overview {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--surface);
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid var(--line);
        }

        .landing-cost-page .equity-overview > div:first-child {
          flex: 1;
        }

        .landing-cost-page .equity-overview strong {
          font-size: 32px;
          color: var(--brand);
        }

        .landing-cost-page .overview-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .landing-cost-page .overview-actions > div {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--surface-soft);
          border-radius: 8px;
          color: var(--muted);
        }

        .landing-cost-page .button-row {
          display: flex;
          gap: 8px;
        }

        .landing-cost-page .list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: var(--surface);
          border-radius: 10px;
          border: 1px solid var(--line);
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .landing-cost-page .list-item:hover {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-soft);
        }

        .landing-cost-page .list-item .mini-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .landing-cost-page .list-item .mini-actions button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: 0;
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .landing-cost-page .list-item .mini-actions button:hover {
          background: var(--surface-soft);
          color: var(--text);
        }

        .landing-cost-page .list-item .mini-actions button:last-child:hover {
          color: var(--danger);
          background: var(--danger-soft);
        }
      `}</style>
    </div>
  );
}
