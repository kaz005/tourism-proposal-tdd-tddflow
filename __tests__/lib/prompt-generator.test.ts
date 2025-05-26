import { generatePrompt } from '@/lib/prompt-generator';
import { FormData } from '@/types';

describe('Prompt Generator', () => {
  const mockFormData: FormData = {
    regionName: '熊野古道周辺地域',
    resources: [
      {
        name: '滝と渓流',
        priority: 'high',
        attractiveness: 5,
        uniqueKeyword: '未開発エリア',
      },
      {
        name: '古民家',
        priority: 'medium',
        attractiveness: 3,
        uniqueKeyword: '歴史的建造物',
      },
    ],
    targetCustomers: '富裕層インバウンド',
    tourConcept: '再生型エコツーリズム×ガストロノミー',
    subsidyPrograms: ['観光庁補助金A', '地方創生推進交付金'],
    initialInvestment: 5000,
    revenueEstimate: '体験 8万円 / 宿泊 5万円',
    managementStructure: '既存DMO・自治体連携',
    additionalNotes: '特に環境配慮を重視',
  };

  test('should generate valid prompt with all input fields', () => {
    const prompt = generatePrompt(mockFormData);

    expect(prompt).toContain('熊野古道周辺地域');
    expect(prompt).toContain('滝と渓流（優先度:高, 魅力度:★★★★★, 未開発エリア）');
    expect(prompt).toContain('古民家（優先度:中, 魅力度:★★★, 歴史的建造物）');
    expect(prompt).toContain('富裕層インバウンド');
    expect(prompt).toContain('再生型エコツーリズム×ガストロノミー');
    expect(prompt).toContain('観光庁補助金A, 地方創生推進交付金');
    expect(prompt).toContain('5000万円');
    expect(prompt).toContain('体験 8万円 / 宿泊 5万円');
    expect(prompt).toContain('既存DMO・自治体連携');
    expect(prompt).toContain('特に環境配慮を重視');
  });

  test('should handle empty resources array', () => {
    const dataWithNoResources = {
      ...mockFormData,
      resources: [],
    };

    const prompt = generatePrompt(dataWithNoResources);
    expect(prompt).toContain('〔地域固有資源リスト〕:\n');
    expect(prompt).not.toContain('★');
  });

  test('should handle empty subsidy programs', () => {
    const dataWithNoSubsidies = {
      ...mockFormData,
      subsidyPrograms: [],
    };

    const prompt = generatePrompt(dataWithNoSubsidies);
    expect(prompt).toContain('〔候補補助金名〕: ');
  });

  test('should handle empty additional notes', () => {
    const dataWithNoNotes = {
      ...mockFormData,
      additionalNotes: '',
    };

    const prompt = generatePrompt(dataWithNoNotes);
    expect(prompt).toContain('〔自由記述フィールド〕: 特になし');
  });

  test('should format attractiveness stars correctly', () => {
    const testData = {
      ...mockFormData,
      resources: [
        { name: 'Test1', priority: 'high' as const, attractiveness: 1 as const, uniqueKeyword: 'test' },
        { name: 'Test2', priority: 'medium' as const, attractiveness: 2 as const, uniqueKeyword: 'test' },
        { name: 'Test3', priority: 'low' as const, attractiveness: 4 as const, uniqueKeyword: 'test' },
      ],
    };

    const prompt = generatePrompt(testData);
    expect(prompt).toContain('Test1（優先度:高, 魅力度:★, test）');
    expect(prompt).toContain('Test2（優先度:中, 魅力度:★★, test）');
    expect(prompt).toContain('Test3（優先度:低, 魅力度:★★★★, test）');
  });
});