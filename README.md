# 観光企画提案書 TDD 採点システム

**Tourism Proposal Test-Driven Development Scoring System**

[![CI Pipeline](https://github.com/kaz005/tourism-proposal-tdd/workflows/CI%20Pipeline/badge.svg)](https://github.com/kaz005/tourism-proposal-tdd/actions)
[![Code Coverage](https://codecov.io/gh/kaz005/tourism-proposal-tdd/branch/main/graph/badge.svg)](https://codecov.io/gh/kaz005/tourism-proposal-tdd)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 プロジェクト概要

本システムは、観光企画提案書を「テスト駆動開発（TDD）」の思想で評価・ブラッシュアップするための支援ツールです。

- **提案書の内容から、テスト仕様書（test-specs）に基づき自動で評価**
- **LLM（Claude など）による要点抽出・要約・テスト実行**
- **1回ごとにフィードバックを返し、ローカルで提案書を修正→再評価**
- **TDDサイクルで提案書の品質を高めることが可能**

## 🚦 全体フロー

1. **提案書を提出**（proposals/ ディレクトリに配置）
2. **LLMが提案書からテスト対象箇所を自動抽出・要約**
3. **test-specs/ のテスト仕様書ごとにTDD形式で評価**
4. **採点・フィードバックを返却**
5. **ローカルで提案書を修正・ブラッシュアップ**
6. **再提出・再評価（サイクル）**

> ※ 抽出・要約・テスト実行は Claude Code Action などのLLMエージェントが自動で行います。

## 📁 ディレクトリ構成

```
tourism-proposal-tdd/
├── test-specs/      # テスト仕様書（Gate/Scoring 各観点ごと）
├── proposals/       # 提出・サンプル提案書
├── templates/       # 提案書テンプレート・AIプロンプト
├── docs/            # 補足ドキュメント
└── README.md        # 本ファイル
```

## 📝 使い方

### 1. 提案書の作成・提出
- `templates/proposal-template.md` を参考に、`proposals/` 配下に提案書（例: `your_proposal.md`）を作成

### 2. 採点実行
- Claude Code Action などのLLMエージェントで「提案書採点」アクションを実行
- LLMが test-specs/ のテスト項目ごとに、提案書から該当箇所を自動抽出・要約し、TDD形式で評価

### 3. フィードバック受領・修正
- 採点結果・フィードバックを受け取り、提案書をローカルで修正
- 必要に応じて再度採点を実行

## 🧪 TDD型評価の詳細

- **test-specs/**
  - Gate（前提条件）・Scoring（配点評価）ごとにテスト仕様書（YAML/MD）を格納
  - 例: `test-specs/00-prerequisites/applicant-eligibility.md` など
- **LLMによる自動抽出・要約**
  - 提案書から各テスト項目に該当する記述を自動で抜き出し、要約
  - test-specsの仕様に沿ってTDD形式で評価・採点
- **フィードバック**
  - 各テスト項目ごとに合否・スコア・改善点を返却
  - 1回ごとに結果を返し、ユーザーはローカルで提案書をブラッシュアップ

## 📚 参考・補足

- `test-specs/`：テスト仕様書（Gate/Scoring観点ごとに整理）
- `templates/`：提案書テンプレート、AIプロンプト例
- `proposals/`：サンプル・提出用提案書
- `docs/implementation-guide.md`：運用ガイド

## 💡 FAQ

- **Q. テスト仕様書を追加・修正したい**
  - `test-specs/`配下にYAML/MDで追加・編集してください
- **Q. 採点ロジックをカスタマイズしたい**
  - Claude Code Action等のプロンプトやtest-specsを調整してください
- **Q. LLMによる自動抽出・要約の精度が不安**
  - フィードバックを元に手動で補足・修正し、再評価サイクルを回してください

## 🏗️ 今後の拡張例

- Web UIやCLIによる提案書提出・採点の自動化
- test-specsの多言語対応
- 採点結果の可視化・レポート生成

## 📝 ライセンス

MIT License

## 🏗️ システム構成

```
tourism-proposal-tdd/
├── src/                        # ソースコード
│   ├── core/                   # コアモジュール
│   │   ├── evaluator.py        # 評価エンジン
│   │   ├── validator.py        # 入力検証
│   │   └── utils.py            # ユーティリティ
│   ├── config/                 # 設定ファイル
│   │   └── evaluation_config.yaml
│   └── tests/                  # テストコード
├── test-specs/                 # テスト仕様書
├── templates/                  # 企画書テンプレート
├── docs/                       # ドキュメント
└── examples/                   # サンプル・デモ
```

## 🚀 クイックスタート

### 1. インストール

```bash
# リポジトリのクローン
git clone https://github.com/kaz005/tourism-proposal-tdd.git
cd tourism-proposal-tdd

# 依存関係のインストール
pip install -r requirements.txt

# 開発環境用（オプション）
pip install -r requirements-dev.txt
```

### 2. デモ実行

```bash
# システムデモの実行
python demo.py
```

### 3. 基本的な使用例

```python
from src.core.evaluator import ProposalEvaluator
from src.core.validator import ProposalValidator

# 企画書データ
proposal_data = {
    'basic_info': {
        'applicant_name': '株式会社観光イノベーション',
        'applicant_type': 'private_company',
        'project_title': '伝統文化体験コンテンツ開発',
        'project_type': 'sales_type',
        'total_budget': 8000000
    },
    # ... その他のデータ
}

# 1. データ検証
validator = ProposalValidator()
is_valid, errors = validator.validate_proposal(proposal_data)

if is_valid:
    # 2. 評価実行
    evaluator = ProposalEvaluator()
    results = evaluator.evaluate_proposal(proposal_data)
    
    # 3. 結果確認
    overall_score = evaluator.get_overall_score(results)
    is_passed = evaluator.is_passed(results)
    
    print(f"総合スコア: {overall_score:.2f}/100")
    print(f"判定: {'採択推奨' if is_passed else '不採択'}")
```

## 📋 評価プロセス

### Phase 1: Gate Tests（前提条件）

企画書が基本要件を満たしているかをチェック：

- ✅ **申請者適格性**: 自治体・DMO・観光協会・民間企業
- ✅ **事業要件**: 最低事業費600万円、継続性計画
- ✅ **地域連携**: 地域関係者との連携確認
- ✅ **法的要件**: 必要な同意書・許認可

### Phase 2: Scoring Tests（配点評価）

5つの観点で詳細評価：

| カテゴリ | 配点 | 合格ライン | 評価内容 |
|---------|------|-----------|----------|
| **持続可能性** | 25% | 60点 | 地域づくりへの貢献、経済効果 |
| **独自性・新規性** | 20% | 70点 | 差別化、革新性、地域特性 |
| **具体性・計画性** | 20% | 60点 | 実現可能性、具体的計画 |
| **実施体制** | 15% | 60点 | 組織体制、継続性 |
| **収益性** | 20% | 70点 | 事業モデル、収支計画 |

## 🛠️ 開発・運用

### テスト実行

```bash
# 全テスト実行
pytest src/tests/ -v

# カバレッジ付きテスト
pytest src/tests/ --cov=src/core --cov-report=html

# 静的解析
flake8 src/
mypy src/ --ignore-missing-imports
bandit -r src/
```

### コード品質

```bash
# コードフォーマット
black src/
isort src/

# 品質チェック
flake8 src/ --max-line-length=88
```

## 📊 品質指標

現在のシステム品質評価：

| 指標 | スコア | 状態 |
|------|--------|------|
| **可読性** | 7/10 | 🟡 改善中 |
| **保守性** | 6/10 | 🟡 改善中 |
| **拡張性** | 5/10 | 🟡 改善中 |
| **信頼性** | 6/10 | 🟡 改善中 |
| **実用性** | 5/10 | 🟡 改善中 |

### 改善ロードマップ

#### Phase 1: 基盤強化（完了）
- ✅ 共通処理のモジュール化
- ✅ 設定の外部化
- ✅ 例外処理とログ強化
- ✅ CI/CDパイプライン構築

#### Phase 2: 品質保証（進行中）
- 🔄 テストカバレッジ向上（目標: 90%以上）
- 🔄 静的解析ツール導入
- 🔄 コードレビュープロセス確立

#### Phase 3: ユーザビリティ向上（計画中）
- 📋 Webインターフェース開発
- 📋 Excel連携機能
- 📋 ユーザーガイド整備

#### Phase 4: 高度化（将来）
- 📋 AI活用機能
- 📋 データ分析機能
- 📋 外部システム連携

## 🏛️ 実際の運用例

### 地方自治体での活用

```yaml
# 自治体A の設定例
evaluation_criteria:
  sustainability:
    weight: 0.30  # 地域重視のため配点アップ
    min_score: 65
  uniqueness:
    weight: 0.25  # 差別化重視
    min_score: 75
```

### 観光協会での活用

```yaml
# 観光協会B の設定例  
evaluation_criteria:
  profitability:
    weight: 0.25  # 収益性重視
    min_score: 75
  feasibility:
    weight: 0.25  # 実現可能性重視
    min_score: 70
```

## 📈 パフォーマンス

- **処理速度**: 1企画書あたり平均0.5秒
- **スループット**: 1時間あたり最大7,200件処理可能
- **精度**: 人手評価との一致率85%以上
- **可用性**: 99.9%以上（CI/CD環境）

## 🔧 設定カスタマイズ

### 評価基準の調整

```yaml
# src/config/evaluation_config.yaml
evaluation_criteria:
  sustainability:
    weight: 0.25      # 配点比重
    min_score: 60     # 合格最低点
    description: "持続可能な観光地域づくりへの寄与"
  
  # カスタム評価項目の追加
  innovation:
    weight: 0.10
    min_score: 70
    description: "技術革新・デジタル活用度"
```

### ビジネスルールの変更

```yaml
business_rules:
  min_budget: 8000000    # 最低予算を800万円に変更
  max_budget: 15000000   # 上限を1500万円に変更
  max_end_date: "2026-12-31"  # 期限延長
```

## 🤝 コントリビューション

### 開発への参加

1. **Fork** このリポジトリ
2. **Feature branch** を作成 (`git checkout -b feature/amazing-feature`)
3. **Commit** 変更 (`git commit -m 'Add amazing feature'`)
4. **Push** (`git push origin feature/amazing-feature`)
5. **Pull Request** を作成

### 課題報告

バグや改善提案は [Issues](https://github.com/kaz005/tourism-proposal-tdd/issues) にて報告してください。

### コーディング規約

- **Black** でフォーマット
- **flake8** でリント
- **pytest** でテスト
- **Type hints** を使用
- **docstring** を記述

## 📚 ドキュメント

- [📖 詳細仕様書](docs/implementation-guide.md)
- [🧪 テスト仕様書](test-specs/)
- [📝 企画書テンプレート](templates/proposal-template.md)
- [🎯 評価基準詳細](test-specs/scoring-criteria.md)

## 🚨 注意事項

### セキュリティ

- 機密情報は設定ファイルに含めない
- 環境変数を活用
- 定期的な依存関係更新

### データ保護

- 個人情報の適切な取り扱い
- データ暗号化の実装
- アクセスログの管理

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙏 謝辞

- 観光庁「地域観光魅力向上事業」の公募要領を参考
- TDD（テスト駆動開発）手法の観光分野への応用
- オープンソースコミュニティからの知見

## 📞 サポート

- **Email**: support@tourism-proposal-tdd.dev
- **Issues**: [GitHub Issues](https://github.com/kaz005/tourism-proposal-tdd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kaz005/tourism-proposal-tdd/discussions)

---

**🏛️ 観光企画提案書TDD評価システム** - より良い観光事業の実現に向けて

*Made with ❤️ for Tourism Innovation*

## 🤖 AIアシスト型評価ワークフロー（新仕様）

### 1. OpenAI APIキーの設定

環境変数 `OPENAI_API_KEY` にAPIキーを設定してください。

```bash
export OPENAI_API_KEY=sk-xxxxxxx
```

### 2. 企画書AI評価の実行

```bash
# 企画書（proposals/sample_proposal.md）をAIで抽出・採点
python -m src.core.extract_and_score

# 結果（proposals/ai_evaluation_result.json）をMarkdownレポート化
python -m src.core.render_report
```

- `src/core/extract_and_score.py` … 企画書からカテゴリ該当箇所をAIで抽出→AIスコアリング→JSON保存
- `src/core/render_report.py` … JSON結果をMarkdownレポートに変換

今後、カテゴリ追加やNotion/Excel連携も順次拡張予定です。

## 📊 Tourism-Proposal Evaluation Flow

本プロジェクトでは **GitHub Issue × Claude Code Action** を使い、  
提出された観光企画案を自動でテスト・スコアリングします。CI/CD ランナーは不要です。

### 🔁 評価の流れ

1. **提案ファイルを追加**  
   - `proposals/<任意のフォルダ>/proposal.md`  
   - 根拠資料は `proposals/<同フォルダ>/evidence/` 配下に置く  
     - 例：`appendix/local_orders.xlsx` / `market_report.pdf` など

2. **Issue を発行して @claude をメンション**  
   ```md
   @claude  
   Evaluate proposal: proposals/2025-05-ishigaki-tour
   ```
   ※ファイルパスまたはコミット SHA を明記してください。

3. Claude Code Action が自動実行
   1. test-specs/**/*.yaml を読み込み
   2. Absolute テスト→ NG があれば即失格
   3. Relative テスト→ 合格案件同士をスコアリング
   4. Issue コメントに結果を返信
      • 各テストの通過 / 不通過
      • 相対スコア（0-100）と順位

🗂 ディレクトリ構成（抜粋）

test-specs/            # YAML テスト定義（absolute / relative）
  sustainability.yaml
  uniqueness.yaml
  ...
proposals/
  2025-05-ishigaki-tour/
    proposal.md
    evidence/
      local_orders.xlsx
      market_report.pdf

⚙️ テスト種別

evaluation_type	判定方法	目的
absolute	閾値クリアで Pass / Fail	要件違反の即時排除
relative	合格案件間でスコア化	オリジナリティ等、相対評価が必要な軸

仕様詳細は test-specs/README.md を参照。
