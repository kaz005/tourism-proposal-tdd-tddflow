import { NextRequest, NextResponse } from 'next/server';
import { PrecisionBoostValidator, ValidationResult } from '@/lib/precision-boost-validator';

export async function POST(request: NextRequest) {
  try {
    const { promptText, proposalText } = await request.json();

    if (!promptText || !proposalText) {
      return NextResponse.json(
        { error: 'promptText and proposalText are required' },
        { status: 400 }
      );
    }

    const validator = new PrecisionBoostValidator();
    const results = validator.validateProposal(promptText, proposalText);

    // 総合スコア計算
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const maxTotalScore = results.reduce((sum, result) => sum + result.maxScore, 0);
    const overallPassed = results.every(result => result.passed);

    const response = {
      overall: {
        passed: overallPassed,
        score: totalScore,
        maxScore: maxTotalScore,
        percentage: Math.round((totalScore / maxTotalScore) * 100)
      },
      validationResults: results,
      summary: {
        characterCount: results[0],
        contentQuality: results[1], 
        flagsAndDirectives: results[2]
      },
      recommendations: generateRecommendations(results)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}

function generateRecommendations(results: ValidationResult[]): string[] {
  const recommendations: string[] = [];

  // 文字数関連の推奨事項
  const charCountResult = results[0];
  if (!charCountResult.passed) {
    const failedDetails = charCountResult.details.filter(d => !d.passed);
    failedDetails.forEach(detail => {
      if (detail.id === 'PRECISION-01-1') {
        recommendations.push('総文字数を18,000字以上に増やしてください。各章の内容を詳細に記述し、具体例や詳細な説明を追加することを推奨します。');
      }
      if (detail.id === 'PRECISION-01-2') {
        recommendations.push('各章の字数下限を満たすよう、内容を充実させてください。特に不足している章に対して具体的な事例や詳細な分析を追加してください。');
      }
      if (detail.id === 'PRECISION-01-4') {
        recommendations.push('各図表に300字以上の詳細な解説を追加してください。図表の内容、意義、示唆について具体的に説明してください。');
      }
      if (detail.id === 'PRECISION-01-5') {
        recommendations.push('全8章の章末に<<Validation Checklist>>を追加し、❶字数❷図表❸審査基準対応の3要素を含むセルフチェックを実装してください。');
      }
    });
  }

  // コンテンツ品質関連の推奨事項
  const qualityResult = results[1];
  if (!qualityResult.passed) {
    const failedDetails = qualityResult.details.filter(d => !d.passed);
    failedDetails.forEach(detail => {
      if (detail.id === 'PRECISION-02-1') {
        recommendations.push('"未定"表記を全て具体的な名称・数値・期間に置き換えてください。仮置きでも構いませんので、具体性を持たせることが重要です。');
      }
      if (detail.id === 'PRECISION-02-2') {
        recommendations.push('各カテゴリ（地名、企業名、人名、施設名、制度名）で最低3つ以上の具体的な固有名詞を使用してください。');
      }
      if (detail.id === 'PRECISION-02-3') {
        recommendations.push('全ての数値に根拠または計算式を併記してください。統計データの出典、算出方法を明示することが必要です。');
      }
      if (detail.id === 'PRECISION-02-6') {
        recommendations.push('500語以上の質の高い英語Executive Summaryを追加してください。専門用語の適切な英訳と文法の正確性に注意してください。');
      }
    });
  }

  // フラグ・ディレクティブ関連の推奨事項
  const flagResult = results[2];
  if (!flagResult.passed) {
    const failedDetails = flagResult.details.filter(d => !d.passed);
    failedDetails.forEach(detail => {
      if (detail.id === 'PRECISION-03-1') {
        recommendations.push('プロンプトの冒頭に精密度ブーストディレクティブを完全に含めてください。必須ディレクティブが不足しています。');
      }
      if (detail.id === 'PRECISION-03-2') {
        recommendations.push('detail_level=ultra, cite_public_stats=yes, add_english_exec_summary=yesの3つのフラグを必ずプロンプトに含めてください。');
      }
      if (detail.id === 'PRECISION-03-5') {
        recommendations.push('English Executive Summaryセクションが生成されていません。add_english_exec_summary=yesフラグの効果を確認してください。');
      }
      if (detail.id === 'PRECISION-03-6') {
        recommendations.push('全8章にValidation Checklistが実装されていません。章末のセルフチェック機能を追加してください。');
      }
    });
  }

  // 全体的な品質向上の推奨事項
  if (recommendations.length === 0) {
    recommendations.push('精密度ブースト要件を満たしています。さらなる品質向上のため、図表の視覚的改善や統計データの最新化を検討してください。');
  }

  return recommendations;
}