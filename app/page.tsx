'use client';

import { useState } from 'react';
import { FormData, TourismResource, GenerationResult, LLMProvider } from '@/types';
import { generatePrompt } from '@/lib/prompt-generator';
import ResourceInput from '@/components/ResourceInput';
import SubsidyInput from '@/components/SubsidyInput';
import ProjectManager from '@/components/ProjectManager';
import ResultDisplay from '@/components/ResultDisplay';
import { Settings, Zap } from 'lucide-react';

const defaultFormData: FormData = {
  regionName: '',
  resources: [],
  targetCustomers: '',
  tourConcept: '',
  subsidyPrograms: [],
  initialInvestment: 0,
  revenueEstimate: '',
  managementStructure: '',
  additionalNotes: '',
};

const llmProviders: LLMProvider[] = [
  { id: 'claude', name: 'Claude (Anthropic)', enabled: true },
  { id: 'openai', name: 'OpenAI GPT-4', enabled: true },
  { id: 'azure', name: 'Azure OpenAI', enabled: true },
];

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [promptText, setPromptText] = useState<string>('');

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください');
      return;
    }

    if (!formData.regionName.trim()) {
      alert('地域名を入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = generatePrompt(formData);
      setPromptText(prompt); // Store prompt for validation
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          provider: selectedProvider,
          apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成に失敗しました');
      }

      const data = await response.json();
      setResult({
        content: data.content,
        provider: data.provider,
        timestamp: new Date(data.timestamp),
      });

    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadProject = (data: FormData) => {
    setFormData(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input Form */}
        <div className="space-y-6">
          {/* Settings Panel */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">設定</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>

            {showSettings && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="form-label">LLMプロバイダー</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="form-input"
                  >
                    {llmProviders.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">APIキー</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="form-input"
                    placeholder="APIキーを入力してください"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    APIキーは安全に処理され、保存されません
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Project Manager */}
          <ProjectManager 
            currentData={formData}
            onLoad={handleLoadProject}
          />

          {/* Main Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">入力フォーム</h2>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">地域名 *</label>
                <input
                  type="text"
                  value={formData.regionName}
                  onChange={(e) => handleInputChange('regionName', e.target.value)}
                  className="form-input"
                  placeholder="例：熊野古道周辺地域"
                  required
                />
              </div>

              <ResourceInput
                resources={formData.resources}
                onChange={(resources) => handleInputChange('resources', resources)}
              />

              <div>
                <label className="form-label">ターゲット客層</label>
                <input
                  type="text"
                  value={formData.targetCustomers}
                  onChange={(e) => handleInputChange('targetCustomers', e.target.value)}
                  className="form-input"
                  placeholder="例：富裕層インバウンド、教育旅行"
                />
              </div>

              <div>
                <label className="form-label">主要ツアーコンセプト</label>
                <input
                  type="text"
                  value={formData.tourConcept}
                  onChange={(e) => handleInputChange('tourConcept', e.target.value)}
                  className="form-input"
                  placeholder="例：再生型エコツーリズム×ガストロノミー"
                />
              </div>

              <SubsidyInput
                subsidies={formData.subsidyPrograms}
                onChange={(subsidies) => handleInputChange('subsidyPrograms', subsidies)}
              />

              <div>
                <label className="form-label">希望初期投資総額（万円）</label>
                <input
                  type="number"
                  value={formData.initialInvestment || ''}
                  onChange={(e) => handleInputChange('initialInvestment', parseInt(e.target.value) || 0)}
                  className="form-input"
                  placeholder="例：5000"
                />
              </div>

              <div>
                <label className="form-label">参考売上単価目安</label>
                <input
                  type="text"
                  value={formData.revenueEstimate}
                  onChange={(e) => handleInputChange('revenueEstimate', e.target.value)}
                  className="form-input"
                  placeholder="例：体験 8万円 / 宿泊 5万円"
                />
              </div>

              <div>
                <label className="form-label">運営体制の骨格</label>
                <input
                  type="text"
                  value={formData.managementStructure}
                  onChange={(e) => handleInputChange('managementStructure', e.target.value)}
                  className="form-input"
                  placeholder="例：既存DMO・自治体連携"
                />
              </div>

              <div>
                <label className="form-label">自由記述フィールド（任意）</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  className="form-textarea"
                  placeholder="深掘りしてほしい要素や特殊条件があれば記入してください"
                  rows={3}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !apiKey.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    計画書を生成
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div>
          <ResultDisplay 
            result={result}
            loading={isGenerating}
            promptText={promptText}
          />
        </div>
      </div>
    </div>
  );
}