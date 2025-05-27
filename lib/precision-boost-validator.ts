export interface ValidationResult {
  testId: string;
  category: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: ValidationDetail[];
  summary: string;
}

export interface ValidationDetail {
  id: string;
  description: string;
  passed: boolean;
  evidence?: string;
  issues?: string[];
}

export class PrecisionBoostValidator {
  
  /**
   * 文字数検証（PRECISION-01）
   */
  validateCharacterCount(proposalText: string): ValidationResult {
    const chapters = this.extractChapters(proposalText);
    const details: ValidationDetail[] = [];
    let score = 0;
    
    // 総文字数チェック
    const totalChars = this.countJapaneseChars(proposalText);
    const totalCharsPassed = totalChars >= 18000;
    details.push({
      id: 'PRECISION-01-1',
      description: '総文字数18,000字以上',
      passed: totalCharsPassed,
      evidence: `総文字数: ${totalChars}字`,
      issues: totalCharsPassed ? [] : ['総文字数が18,000字未満です']
    });
    
    if (totalCharsPassed) score += 5;
    
    // 章別文字数チェック
    const chapterRequirements = {
      'I': { name: 'エグゼクティブサマリー', min: 2500 },
      'II': { name: '観光振興の現状と補助金審査の視点', min: 2000 },
      'III': { name: '独自性と地域貢献を核とした旅行企画', min: 3500 },
      'IV': { name: '自走可能な収益モデル', min: 3000 },
      'V': { name: '参考・先行事例との比較分析', min: 2500 },
      'VI': { name: 'プロジェクト実現ロードマップ & KPI', min: 2500 },
      'VII': { name: 'リスク & ミティゲーション', min: 2000 },
      'VIII': { name: '結論 / 審査委員へのクロージングメッセージ', min: 2000 }
    };
    
    let allChaptersPassed = true;
    const chapterIssues: string[] = [];
    
    for (const [chapterId, req] of Object.entries(chapterRequirements)) {
      const chapterText = chapters[chapterId] || '';
      const chapterChars = this.countJapaneseChars(chapterText);
      const passed = chapterChars >= req.min;
      
      if (!passed) {
        allChaptersPassed = false;
        chapterIssues.push(`第${chapterId}章「${req.name}」: ${chapterChars}字 (必要: ${req.min}字)`);
      }
    }
    
    details.push({
      id: 'PRECISION-01-2',
      description: '各章の字数下限遵守',
      passed: allChaptersPassed,
      evidence: `章別文字数チェック完了`,
      issues: chapterIssues
    });
    
    if (allChaptersPassed) score += 5;
    
    // 図表解説文チェック
    const figureExplanations = this.extractFigureExplanations(proposalText);
    const allExplanationsValid = figureExplanations.every(exp => exp.length >= 300);
    
    details.push({
      id: 'PRECISION-01-4',
      description: '図表解説文が各300字以上',
      passed: allExplanationsValid,
      evidence: `図表解説文チェック: ${figureExplanations.length}件`,
      issues: allExplanationsValid ? [] : ['300字未満の図表解説があります']
    });
    
    if (allExplanationsValid) score += 2;
    
    // Validation Checklistチェック
    const checklistCount = (proposalText.match(/<<Validation Checklist>>/g) || []).length;
    const checklistPassed = checklistCount >= 8;
    
    details.push({
      id: 'PRECISION-01-5',
      description: 'Validation Checklistが全章末に存在',
      passed: checklistPassed,
      evidence: `Validation Checklist: ${checklistCount}件`,
      issues: checklistPassed ? [] : [`Validation Checklistが${checklistCount}件しかありません（必要: 8件）`]
    });
    
    if (checklistPassed) score += 2;
    
    return {
      testId: 'PRECISION-01',
      category: '文字数・章別字数検証',
      passed: score >= 10,
      score,
      maxScore: 20,
      details,
      summary: `文字数検証結果: ${score}/20点 (総文字数: ${totalChars}字)`
    };
  }
  
  /**
   * コンテンツ品質検証（PRECISION-02）
   */
  validateContentQuality(proposalText: string): ValidationResult {
    const details: ValidationDetail[] = [];
    let score = 0;
    
    // "未定"表記チェック
    const pendingCount = (proposalText.match(/未定/g) || []).length;
    const noPendingTerms = pendingCount === 0;
    
    details.push({
      id: 'PRECISION-02-1',
      description: '"未定"表記の完全排除',
      passed: noPendingTerms,
      evidence: `"未定"出現回数: ${pendingCount}回`,
      issues: noPendingTerms ? [] : [`"未定"が${pendingCount}箇所で使用されています`]
    });
    
    if (noPendingTerms) score += 5;
    
    // 固有名詞チェック
    const properNouns = this.extractProperNouns(proposalText);
    const sufficientProperNouns = Object.values(properNouns).every(list => list.length >= 3);
    
    details.push({
      id: 'PRECISION-02-2',
      description: '具体的な固有名詞の使用',
      passed: sufficientProperNouns,
      evidence: `固有名詞カテゴリ別: 地名${properNouns.places.length}件, 企業名${properNouns.companies.length}件`,
      issues: sufficientProperNouns ? [] : ['各カテゴリで3つ以上の固有名詞が必要です']
    });
    
    if (sufficientProperNouns) score += 5;
    
    // 数値根拠チェック
    const numbersWithSources = this.countNumbersWithSources(proposalText);
    const totalNumbers = this.countAllNumbers(proposalText);
    const hasNumericalEvidence = totalNumbers > 0 && (numbersWithSources / totalNumbers) >= 0.8;
    
    details.push({
      id: 'PRECISION-02-3',
      description: '数値の根拠と計算式明示',
      passed: hasNumericalEvidence,
      evidence: `根拠付き数値: ${numbersWithSources}/${totalNumbers}`,
      issues: hasNumericalEvidence ? [] : ['数値の80%以上に根拠または計算式が必要です']
    });
    
    if (hasNumericalEvidence) score += 5;
    
    // 英語要約チェック
    const englishSummary = this.extractEnglishSummary(proposalText);
    const hasQualityEnglishSummary = englishSummary && englishSummary.split(' ').length >= 500;
    
    details.push({
      id: 'PRECISION-02-6',
      description: '英語Executive Summaryの品質',
      passed: hasQualityEnglishSummary,
      evidence: `英語要約語数: ${englishSummary ? englishSummary.split(' ').length : 0}語`,
      issues: hasQualityEnglishSummary ? [] : ['500語以上の英語要約が必要です']
    });
    
    if (hasQualityEnglishSummary) score += 2;
    
    return {
      testId: 'PRECISION-02',
      category: 'コンテンツ品質検証',
      passed: score >= 15,
      score,
      maxScore: 25,
      details,
      summary: `品質検証結果: ${score}/25点`
    };
  }
  
  /**
   * フラグ・ディレクティブ検証（PRECISION-03）
   */
  validateFlagsAndDirectives(promptText: string, generatedContent?: string): ValidationResult {
    const details: ValidationDetail[] = [];
    let score = 0;
    
    // ディレクティブ存在チェック
    const requiredDirectives = [
      '# ─── 精密度ブースト ───',
      '総文字数 18,000 字以上',
      '章ごとに【字数下限】を満たすこと',
      '各図表の本文中プレビューを **300 字以上** で具体記述',
      '固有名詞・数値・価格・期間・役割分担は "未定" 禁止',
      '章末に <<Validation Checklist>> を出力'
    ];
    
    const missingDirectives = requiredDirectives.filter(directive => !promptText.includes(directive));
    const allDirectivesPresent = missingDirectives.length === 0;
    
    details.push({
      id: 'PRECISION-03-1',
      description: '精密度ブーストディレクティブの存在',
      passed: allDirectivesPresent,
      evidence: `必須ディレクティブ: ${requiredDirectives.length - missingDirectives.length}/${requiredDirectives.length}`,
      issues: missingDirectives.length > 0 ? [`不足ディレクティブ: ${missingDirectives.join(', ')}`] : []
    });
    
    if (allDirectivesPresent) score += 5;
    
    // フラグ存在チェック
    const requiredFlags = [
      'detail_level=ultra',
      'cite_public_stats=yes',
      'add_english_exec_summary=yes'
    ];
    
    const missingFlags = requiredFlags.filter(flag => !promptText.includes(flag));
    const allFlagsPresent = missingFlags.length === 0;
    
    details.push({
      id: 'PRECISION-03-2',
      description: '必須フラグの設定',
      passed: allFlagsPresent,
      evidence: `必須フラグ: ${requiredFlags.length - missingFlags.length}/${requiredFlags.length}`,
      issues: missingFlags.length > 0 ? [`不足フラグ: ${missingFlags.join(', ')}`] : []
    });
    
    if (allFlagsPresent) score += 5;
    
    // 生成コンテンツでの効果確認（あれば）
    if (generatedContent) {
      const hasEnglishSummary = generatedContent.includes('English Executive Summary');
      const validationChecklistCount = (generatedContent.match(/<<Validation Checklist>>/g) || []).length;
      
      details.push({
        id: 'PRECISION-03-5',
        description: 'add_english_exec_summary=yesの効果確認',
        passed: hasEnglishSummary,
        evidence: `英語要約セクション存在: ${hasEnglishSummary ? 'あり' : 'なし'}`,
        issues: hasEnglishSummary ? [] : ['English Executive Summaryセクションが見つかりません']
      });
      
      if (hasEnglishSummary) score += 1;
      
      details.push({
        id: 'PRECISION-03-6',
        description: 'Validation Checklistの実装確認',
        passed: validationChecklistCount >= 8,
        evidence: `Validation Checklist数: ${validationChecklistCount}`,
        issues: validationChecklistCount >= 8 ? [] : [`Validation Checklistが${validationChecklistCount}件のみ（必要: 8件）`]
      });
      
      if (validationChecklistCount >= 8) score += 1;
    }
    
    return {
      testId: 'PRECISION-03',
      category: 'フラグ・ディレクティブ検証',
      passed: score >= 10,
      score,
      maxScore: 15,
      details,
      summary: `フラグ検証結果: ${score}/15点`
    };
  }
  
  /**
   * 総合検証実行
   */
  validateProposal(promptText: string, proposalText: string): ValidationResult[] {
    return [
      this.validateCharacterCount(proposalText),
      this.validateContentQuality(proposalText),
      this.validateFlagsAndDirectives(promptText, proposalText)
    ];
  }
  
  // ヘルパーメソッド
  private countJapaneseChars(text: string): number {
    // ひらがな、カタカナ、漢字のみをカウント
    const japaneseChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
    return japaneseChars ? japaneseChars.length : 0;
  }
  
  private extractChapters(text: string): {[key: string]: string} {
    const chapters: {[key: string]: string} = {};
    const chapterRegex = /(\*\*)?([IV]+)\.\s*(.+?)\*\*\s*【字数下限:(\d+)字】([\s\S]*?)(?=(\*\*)?([IV]+)\.\s*(.+?)\*\*\s*【字数下限:(\d+)字】|$)/g;
    
    let match;
    while ((match = chapterRegex.exec(text)) !== null) {
      const chapterNum = match[2];
      const content = match[5];
      chapters[chapterNum] = content;
    }
    
    return chapters;
  }
  
  private extractFigureExplanations(text: string): string[] {
    const explanations: string[] = [];
    const figureRegex = /(Fig-\d+|Table-\d+)[\s\S]*?\（\*\*300字以上\*\*の詳細解説付き\）([\s\S]*?)(?=Fig-\d+|Table-\d+|\*\*[IV]+\.|$)/g;
    
    let match;
    while ((match = figureRegex.exec(text)) !== null) {
      const explanation = match[2].trim();
      if (explanation) {
        explanations.push(explanation);
      }
    }
    
    return explanations;
  }
  
  private extractProperNouns(text: string): {places: string[], companies: string[], people: string[], facilities: string[], systems: string[]} {
    return {
      places: this.extractByPattern(text, /[都道府県市町村区]\s*[^\s、。]*|[^\s]*[温泉山川湖島駅空港]/g),
      companies: this.extractByPattern(text, /[^\s]*[株式会社有限会社合同会社][^\s、。]*|[^\s]*[Co\.Ltd\.Inc\.Corp\.][^\s、。]*/g),
      people: this.extractByPattern(text, /[^\s]*[氏さん様][^\s、。]*|[A-Z][a-z]+\s+[A-Z][a-z]+/g),
      facilities: this.extractByPattern(text, /[^\s]*[ホテル旅館民宿センターミュージアム美術館][^\s、。]*/g),
      systems: this.extractByPattern(text, /[^\s]*[制度システム認証基準][^\s、。]*/g)
    };
  }
  
  private extractByPattern(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches ? [...new Set(matches)] : [];
  }
  
  private countNumbersWithSources(text: string): number {
    const numberWithSourcePattern = /\d+[万千百十億兆円％人泊日年月]\s*[（\(][^）\)]*[出典根拠計算][^）\)]*[）\)]/g;
    const matches = text.match(numberWithSourcePattern);
    return matches ? matches.length : 0;
  }
  
  private countAllNumbers(text: string): number {
    const numberPattern = /\d+[万千百十億兆円％人泊日年月]/g;
    const matches = text.match(numberPattern);
    return matches ? matches.length : 0;
  }
  
  private extractEnglishSummary(text: string): string | null {
    const englishSummaryRegex = /\*\*English Executive Summary\*\*([\s\S]*?)(?=\*\*|$)/;
    const match = text.match(englishSummaryRegex);
    return match ? match[1].trim() : null;
  }
}