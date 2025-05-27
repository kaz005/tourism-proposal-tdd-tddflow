import { PrecisionBoostValidator } from '@/lib/precision-boost-validator';

describe('PrecisionBoostValidator', () => {
  let validator: PrecisionBoostValidator;

  beforeEach(() => {
    validator = new PrecisionBoostValidator();
  });

  describe('validateCharacterCount', () => {
    it('should pass when total character count is >= 18000', () => {
      const mockProposal = generateMockProposal(20000);
      const result = validator.validateCharacterCount(mockProposal);
      
      expect(result.testId).toBe('PRECISION-01');
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });

    it('should fail when total character count is < 18000', () => {
      const mockProposal = generateMockProposal(15000);
      const result = validator.validateCharacterCount(mockProposal);
      
      expect(result.passed).toBe(false);
      expect(result.details[0].passed).toBe(false);
      expect(result.details[0].issues).toContain('総文字数が18,000字未満です');
    });

    it('should validate chapter character count requirements', () => {
      const mockProposal = `
        **I. エグゼクティブサマリー**【字数下限:2,500字】
        ${'あ'.repeat(3000)}
        
        **II. 観光振興の現状と補助金審査の視点**【字数下限:2,000字】
        ${'い'.repeat(2200)}
        
        **III. 独自性と地域貢献を核とした旅行企画**【字数下限:3,500字】
        ${'う'.repeat(4000)}
        
        **IV. 自走可能な収益モデル**【字数下限:3,000字】
        ${'え'.repeat(3200)}
        
        **V. 参考・先行事例との比較分析**【字数下限:2,500字】
        ${'お'.repeat(2700)}
        
        **VI. プロジェクト実現ロードマップ & KPI**【字数下限:2,500字】
        ${'か'.repeat(2600)}
        
        **VII. リスク & ミティゲーション**【字数下限:2,000字】
        ${'き'.repeat(2100)}
        
        **VIII. 結論 / 審査委員へのクロージングメッセージ**【字数下限:2,000字】
        ${'く'.repeat(2200)}
      `;

      const result = validator.validateCharacterCount(mockProposal);
      expect(result.details[1].passed).toBe(true);
    });
  });

  describe('validateContentQuality', () => {
    it('should pass when no "未定" terms are used', () => {
      const mockProposal = `
        観光企画では田中太郎氏が責任者となり、
        500万円の初期投資で2024年4月から開始予定。
        地域の温泉旅館10軒と連携協定を締結済み。
      `;

      const result = validator.validateContentQuality(mockProposal);
      expect(result.details[0].passed).toBe(true);
    });

    it('should fail when "未定" terms are found', () => {
      const mockProposal = `
        観光企画では責任者は未定で、
        初期投資額も未定。開始時期も未定。
      `;

      const result = validator.validateContentQuality(mockProposal);
      expect(result.details[0].passed).toBe(false);
      expect(result.details[0].issues?.[0]).toContain('"未定"が3箇所で使用されています');
    });

    it('should validate proper nouns usage', () => {
      const mockProposal = `
        群馬県草津町の草津温泉で、草津観光協会、
        草津温泉ホテル、湯畑亭、山田太郎氏、佐藤花子氏、田中次郎氏と連携。
        株式会社温泉開発、有限会社地域振興、合同会社観光促進との協業。
        草津白根山観光センター、草津スキー場、湯畑美術館を活用。
      `;

      const result = validator.validateContentQuality(mockProposal);
      expect(result.details[1].passed).toBe(true);
    });
  });

  describe('validateFlagsAndDirectives', () => {
    it('should pass when all required directives and flags are present', () => {
      const mockPrompt = `
        # ─── 精密度ブースト ───
        ▼生成条件（必須）:
        ・総文字数 18,000 字以上  
        ・章ごとに【字数下限】を満たすこと  
        ・各図表の本文中プレビューを **300 字以上** で具体記述  
        ・固有名詞・数値・価格・期間・役割分担は "未定" 禁止、必ず仮置きでも記載  
        ・章末に <<Validation Checklist>> を出力し、❶字数❷必須図表❸審査基準対応 を自己検証  
        ▼生成条件: detail_level=ultra
        ▼生成条件: cite_public_stats=yes
        ▼生成条件: add_english_exec_summary=yes
      `;

      const result = validator.validateFlagsAndDirectives(mockPrompt);
      expect(result.passed).toBe(true);
      expect(result.details[0].passed).toBe(true); // directives
      expect(result.details[1].passed).toBe(true); // flags
    });

    it('should fail when required flags are missing', () => {
      const mockPrompt = `
        # ─── 精密度ブースト ───
        ▼生成条件: detail_level=ultra
        ▼生成条件: cite_public_stats=yes
      `;

      const result = validator.validateFlagsAndDirectives(mockPrompt);
      expect(result.details[1].passed).toBe(false);
      expect(result.details[1].issues?.[0]).toContain('add_english_exec_summary=yes');
    });

    it('should validate generated content effects when provided', () => {
      const mockPrompt = `
        # ─── 精密度ブースト ───
        ▼生成条件: detail_level=ultra
        ▼生成条件: cite_public_stats=yes
        ▼生成条件: add_english_exec_summary=yes
      `;

      const mockGeneratedContent = `
        **English Executive Summary**
        This tourism proposal aims to...
        
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
        <<Validation Checklist>>
      `;

      const result = validator.validateFlagsAndDirectives(mockPrompt, mockGeneratedContent);
      expect(result.details.some(d => d.id === 'PRECISION-03-5' && d.passed)).toBe(true);
      expect(result.details.some(d => d.id === 'PRECISION-03-6' && d.passed)).toBe(true);
    });
  });

  describe('validateProposal - integration test', () => {
    it('should run all validation tests and return comprehensive results', () => {
      const mockPrompt = `
        # ─── 精密度ブースト ───
        ▼生成条件（必須）:
        ・総文字数 18,000 字以上  
        ・章ごとに【字数下限】を満たすこと  
        ・各図表の本文中プレビューを **300 字以上** で具体記述  
        ・固有名詞・数値・価格・期間・役割分担は "未定" 禁止、必ず仮置きでも記載  
        ・章末に <<Validation Checklist>> を出力し、❶字数❷必須図表❸審査基準対応 を自己検証  
        ▼生成条件: detail_level=ultra
        ▼生成条件: cite_public_stats=yes
        ▼生成条件: add_english_exec_summary=yes
      `;

      const mockProposal = generateComprehensiveMockProposal();
      const results = validator.validateProposal(mockPrompt, mockProposal);

      expect(results).toHaveLength(3);
      expect(results[0].testId).toBe('PRECISION-01');
      expect(results[1].testId).toBe('PRECISION-02');
      expect(results[2].testId).toBe('PRECISION-03');
    });
  });
});

function generateMockProposal(targetLength: number): string {
  const baseChar = 'あ';
  return baseChar.repeat(targetLength);
}

function generateComprehensiveMockProposal(): string {
  return `
    **I. エグゼクティブサマリー**【字数下限:2,500字】
    ${'あ'.repeat(3000)}
    Fig-1 企画全体の価値連鎖図（**300字以上**の詳細解説付き）${'図'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❷図表品質❸審査基準対応
    
    **II. 観光振興の現状と補助金審査の視点**【字数下限:2,000字】
    ${'い'.repeat(2200)}
    <<Validation Checklist>> ❶字数確認❷統計データ引用❸政策整合性
    
    **III. 独自性と地域貢献を核とした旅行企画**【字数下限:3,500字】
    ${'う'.repeat(4000)}
    Fig-2 体験行程フローチャート（**300字以上**の詳細解説付き）${'フ'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❹独自性要素❸他地域との差別化
    
    **IV. 自走可能な収益モデル**【字数下限:3,000字】
    ${'え'.repeat(3200)}
    Fig-3 5年P/Lシミュレーション（**300字以上**の詳細解説付き）${'収'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❷数値根拠❸収益持続性
    
    **V. 参考・先行事例との比較分析**【字数下限:2,500字】
    ${'お'.repeat(2700)}
    Table-1 事例比較表（**300字以上**の詳細解説付き）${'比'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❷事例数❸比較軸の妥当性
    
    **VI. プロジェクト実現ロードマップ & KPI**【字数下限:2,500字】
    ${'か'.repeat(2600)}
    Fig-4 ガントチャート（**300字以上**の詳細解説付き）${'進'.repeat(350)}
    Table-2 KPI表（**300字以上**の詳細解説付き）${'指'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❷スケジュール実現性❸KPI妥当性
    
    **VII. リスク & ミティゲーション**【字数下限:2,000字】
    ${'き'.repeat(2100)}
    Table-3 リスクマトリクス表（**300字以上**の詳細解説付き）${'危'.repeat(350)}
    <<Validation Checklist>> ❶字数確認❷リスク網羅性❸対策具体性
    
    **VIII. 結論 / 審査委員へのクロージングメッセージ**【字数下限:2,000字】
    ${'く'.repeat(2200)}
    **English Executive Summary**
    ${'This tourism proposal presents an innovative approach to regional development through sustainable tourism. The project aims to create a comprehensive ecosystem that leverages local resources while ensuring economic viability and community engagement. Our strategy focuses on three core pillars: authentic cultural experiences, sustainable practices, and technology integration. The proposed investment of 5 million yen will generate an estimated economic impact of 75 million yen over five years, creating 25 permanent jobs and attracting 10,000 annual visitors. Through partnerships with local stakeholders including Gunma Tourism Association, Kusatsu Onsen Hotel Group, and regional municipalities, we will establish a replicable model for rural tourism development. The project timeline spans 48 months with clearly defined milestones and KPIs to ensure accountability and success measurement. Risk mitigation strategies address potential challenges including weather dependency, market fluctuations, and regulatory changes. This comprehensive approach positions the project as a catalyst for broader regional transformation while preserving cultural heritage and environmental sustainability. The expected return on investment exceeds 15x within the five-year period, demonstrating both social and economic value creation.'.split(' ').slice(0, 500).join(' ')}
    <<Validation Checklist>> ❶字数確認❷英語要約品質❸訴求力
    
    群馬県草津町の草津温泉で田中太郎氏が責任者となり、
    株式会社温泉開発、有限会社地域振興、合同会社観光促進、
    佐藤花子氏、山田次郎氏、草津観光協会、
    草津温泉ホテル、湯畑亭、草津白根山観光センターと連携。
    初期投資500万円（根拠：設備費300万円+運営費200万円）で開始。
  `;
}