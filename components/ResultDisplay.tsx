'use client';

import { useState } from 'react';
import { GenerationResult } from '@/types';
import { exportToPDF, exportToWord, exportToMarkdown } from '@/lib/export';
import { Download, FileText, File, Hash } from 'lucide-react';

interface ResultDisplayProps {
  result: GenerationResult | null;
  loading: boolean;
}

export default function ResultDisplay({ result, loading }: ResultDisplayProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'markdown'>('markdown');

  const handleExport = async () => {
    if (!result) return;

    setIsExporting(true);
    try {
      const filename = `tourism-proposal-${new Date().toISOString().split('T')[0]}`;
      
      switch (exportFormat) {
        case 'pdf':
          await exportToPDF(result.content, filename);
          break;
        case 'word':
          await exportToWord(result.content, filename);
          break;
        case 'markdown':
          exportToMarkdown(result.content, filename);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">事業計画書を生成中...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card">
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>フォームに入力して「計画書を生成」ボタンをクリックしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">生成結果</h3>
            <p className="text-sm text-gray-500">
              生成元: {result.provider} | 
              生成日時: {result.timestamp.toLocaleString('ja-JP')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'word' | 'markdown')}
              className="form-input w-auto"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="word">Word (.docx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  エクスポート中...
                </>
              ) : (
                <>
                  <Download size={16} />
                  エクスポート
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="card">
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {result.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}