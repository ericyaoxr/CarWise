import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function DataExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const exportData = useAppStore((state) => state.exportData);
  const importData = useAppStore((state) => state.importData);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `carwise-data-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: '数据导出成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('导出失败:', error);
      setMessage({ type: 'error', text: '数据导出失败，请重试。' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importData(content);
        setMessage({ type: 'success', text: '数据导入成功！' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('导入失败:', error);
        setMessage({ type: 'error', text: '数据导入失败，请检查文件格式。' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    // 重置输入
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {message && (
        <div className={`flex items-center gap-2 p-2 rounded ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
        >
          <Download size={16} />
          导出数据
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 text-sm transition-colors"
        >
          <Upload size={16} />
          导入数据
        </button>
      </div>
    </div>
  );
}
