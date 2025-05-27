'use client';

import { useState, useEffect } from 'react';
import { GenerationResult } from '@/types';
import { exportToPDF, exportToWord, exportToMarkdown } from '@/lib/export';
import { Download, FileText, File, Hash, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ValidationResult {
  overall: {
    passed: boolean;
    score: number;
    maxScore: number;
    percentage: number;
  };
  validationResults: Array<{
    testId: string;
    category: string;
    passed: boolean;
    score: number;
    maxScore: number;
    details: Array<{
      id: string;
      description: string;
      passed: boolean;
      evidence?: string;
      issues?: string[];
    }>;
    summary: string;
  }>;
  recommendations: string[];
}

interface ResultDisplayProps {
  result: GenerationResult | null;
  loading: boolean;
  promptText?: string;
}

export default function ResultDisplay({ result, loading, promptText }: ResultDisplayProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'markdown'>('markdown');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // 自動バリデーション実行
  useEffect(() => {
    if (result && promptText && !validationResult) {
      handleValidation();
    }
  }, [result, promptText]);

  const handleValidation = async () => {
    if (!result || !promptText) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/validate-precision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptText: promptText,
          proposalText: result.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data = await response.json();
      setValidationResult(data);
      setShowValidation(true);
    } catch (error) {
      console.error('Validation error:', error);
      alert('バリデーションに失敗しました。');
    } finally {
      setIsValidating(false);
    }
  };

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
            <button
              onClick={() => setShowValidation(!showValidation)}
              disabled={isValidating}
              className="btn-secondary flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  検証中...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  精密度検証
                  {validationResult && (
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      validationResult.overall.passed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {validationResult.overall.percentage}%
                    </span>
                  )}
                </>
              )}
            </button>
            
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

      {/* Precision Boost Validation Results */}
      {showValidation && validationResult && (
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-800">精密度ブースト検証結果</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                validationResult.overall.passed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {validationResult.overall.passed ? '合格' : '要改善'}
              </span>
              <span className="text-sm text-gray-500">
                {validationResult.overall.score}/{validationResult.overall.maxScore}点 
                ({validationResult.overall.percentage}%)
              </span>
            </div>

            {/* Validation Categories */}
            <div className="grid gap-4 md:grid-cols-3">
              {validationResult.validationResults.map((category) => (
                <div key={category.testId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {category.passed ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600" />
                    )}
                    <h4 className="font-medium text-sm">{category.category}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{category.summary}</p>
                  <div className="text-xs text-gray-600">
                    {category.score}/{category.maxScore}点
                  </div>
                  
                  {/* Detail breakdown */}
                  <div className="mt-3 space-y-1">
                    {category.details.map((detail) => (
                      <div key={detail.id} className="flex items-start gap-2 text-xs">
                        {detail.passed ? (
                          <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <span className="text-gray-700">{detail.description}</span>
                          {detail.evidence && (
                            <div className="text-gray-500 italic">{detail.evidence}</div>
                          )}
                          {detail.issues && detail.issues.length > 0 && (
                            <div className="text-red-600">
                              {detail.issues.map((issue, idx) => (
                                <div key={idx}>• {issue}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {validationResult.recommendations.length > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-600" />
                  <h4 className="font-medium text-blue-800">改善提案</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {validationResult.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

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