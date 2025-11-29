# AI Presentation Generator

世界最高峰のプレゼンテーション生成ツール 🚀

AIを活用して、ドキュメント（PDF, Excel, Word）、音声、画像、動画、WebサイトURLから、聴衆の心を動かすプレゼンテーションを自動生成します。

![AI Presentation Generator](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特徴

### 🎯 世界最高峰のデザイン原則

- **1スライド1メッセージ**: Adobe, @Living, okunoteのベストプラクティスに基づく
- **PREP法**: Point → Reason → Example → Point の効果的な構成
- **Zの法則**: 視線の流れを考慮した最適なレイアウト
- **4色ルール**: 配色を4色以内に制限し、洗練されたデザインを実現
- **近接の原則**: 情報のグルーピングと余白の最適化

### 🤖 AI分析エンジン

- **マルチフォーマット対応**: PDF, Word, Excel, Text, 音声, 画像, 動画, URL
- **深い理解**: OpenAI GPT-4を使用した高度なコンテンツ分析
- **感情認識**: コンテンツの感情的トーンを把握し、適切な表現を提案
- **データ抽出**: 重要なデータポイントとキーメッセージの自動抽出

### 📊 インテリジェントなワークフロー

1. **ファイル/URL入力**: ドラッグ&ドロップで簡単アップロード
2. **資料タイプ選択**: 営業資料、分析資料、研修資料など9種類のプリセット + カスタム入力
3. **AI分析**: コンテンツを深く理解し、重要な要素を抽出
4. **5つのストーリーライン提案**: 資料タイプとターゲットに応じた最適な構成案
5. **ドラフト編集**: 目次やスライド内容の編集、並び替え、削除が可能
6. **詳細スライド生成**: レイアウト、ビジュアル、スピーカーノート
7. **エクスポート**: Google Slides / PowerPoint (JSON → PPTX変換)

### 🎨 カスタマイズ可能

- **資料タイプ**: 営業資料、分析資料、研修資料、概念説明資料、企画書・提案書、報告書、議事録・記録、マニュアル・手順書、案内・通知資料、カスタム
- **10種類のフォント**: メイリオ、游ゴシック、Arial など
- **アニメーションレベル**: なし / 最低限 / ほどほど / 多用
- **トーンスタイル**: スタンダード（ビジネス）/ カジュアル（親しみやすい）
- **カスタムテンプレート**: 既存のGoogle SlidesやPPTXをテンプレートとして使用可能
- **ドラフト編集**: 目次やスライドの内容、順序を自由に編集可能

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- OpenAI API Key（必須）
- Google Apps Script URL（スライド生成用、オプション）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Meguroman1978/slide_generator.git
cd slide_generator

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集してAPI Keyを追加

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 🔑 API Key の取得方法

### OpenAI API Key（必須）

1. [OpenAI Platform](https://platform.openai.com/signup) でアカウント作成
2. API Keys ページで「Create new secret key」をクリック
3. 生成されたキーをコピーして `.env.local` に追加

```env
OPENAI_API_KEY=sk-...
```

### Anthropic API Key（オプション）

1. [Anthropic Console](https://console.anthropic.com/) でアカウント作成
2. API Keysセクションで新しいキーを生成
3. `.env.local` に追加

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Google Apps Script（スライド生成用、オプション）

Google Slidesへの直接出力には、Apps Scriptのデプロイが必要です。

**3ステップで簡単セットアップ:**

1. `apps-script/Code.gs` をコピー
2. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成してペースト
3. デプロイ → 新しいデプロイ → ウェブアプリ → **「アクセスできるユーザー」を「全員」に設定** → URLを取得

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/...
```

**⚠️ 注意**: 401エラーが発生する場合は、アクセス権限が「全員」になっているか確認してください。

## 📖 使い方

### 1. ファイル/URLのアップロード

- ドラッグ&ドロップでファイルをアップロード
- URLを入力してWebページやYouTube動画を分析

### 2. 資料タイプの選択

- 作成する資料のタイプを選択（9種類のプリセット + カスタム）
- ストーリーライン生成時に資料タイプに応じた最適な構成を提案

### 3. 分析開始

- オプションで追加指示を入力
- 「分析開始」ボタンをクリック

### 4. ストーリーライン選択

- AIが生成した5つのストーリーライン案から選択
- 各案にはターゲット、キーメッセージ、構成の流れ（1. 2. 3...の連番）が含まれます
- カスタムストーリーライン作成も可能

### 5. ドラフト編集

- スライド構成のプレビュー
- タイトル、目次、各スライドの内容を編集可能
- スライドの順序変更、削除、追加が可能

### 6. スライド生成

- 詳細なスライドを自動生成
- レイアウト、ビジュアルプロンプト、スピーカーノートが含まれます

### 7. エクスポート

- **Google Slides**: Apps Script URLを設定して直接出力（401エラーが出る場合は設定を確認）
- **PowerPoint**: JSONデータをダウンロードし、[Aspose Converter](https://products.aspose.app/cells/ja/conversion/json-to-powerpoint)でPPTXに変換

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, TypeScript
- **スタイリング**: TailwindCSS, shadcn/ui
- **状態管理**: Zustand
- **AI**: OpenAI GPT-4, Anthropic Claude
- **ファイル処理**: pdf-parse, mammoth, xlsx
- **デプロイ**: Vercel

## 📁 プロジェクト構造

```
slide_generator/
├── app/
│   ├── api/           # API エンドポイント
│   │   ├── parse/     # ファイル解析
│   │   ├── analyze/   # AI分析
│   │   ├── storyline/ # ストーリーライン生成
│   │   ├── draft/     # ドラフト生成
│   │   └── slides/    # スライド詳細生成
│   ├── layout.tsx
│   └── page.tsx       # メインページ
├── components/
│   ├── ui/            # shadcn/ui コンポーネント
│   ├── FileUploader.tsx
│   ├── SettingsDialog.tsx
│   ├── PresentationTypeSelector.tsx  # NEW: 資料タイプ選択
│   ├── StorylineSelector.tsx
│   ├── DraftReview.tsx
│   └── DraftEditor.tsx               # NEW: ドラフト編集機能
├── lib/
│   ├── stores/        # Zustand ストア
│   ├── api/           # API クライアント
│   ├── parsers/       # ファイルパーサー
│   ├── generators/    # スライド生成
│   └── constants/     # 定数とデザインルール
├── types/             # TypeScript型定義
└── public/
    └── templates/     # テンプレートファイル
```

## 🎨 デザイン原則

このツールは、以下のプレゼンテーションデザインのベストプラクティスに基づいています：

### Adobe デザイン原則
- **整列**: 要素を揃えて統一感
- **近接**: 関連項目をグルーピング
- **反復**: ルールを繰り返し適用
- **対比**: 重要部分にメリハリ

### @Living & okunote の Tips
- **1スライド1メッセージ**: 情報を詰め込まない
- **PREP法**: 効果的なストーリーテリング
- **Zの法則**: 視線の流れを考慮
- **配色制限**: 4色以内でプロフェッショナルに
- **余白の美学**: 適度な余白で洗練された印象

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

MIT License

## 🙏 謝辞

- Adobe - デザイン原則
- @Living - プレゼンテーションTips
- okunote - スライド作成ベストプラクティス
- OpenAI - GPT-4 API
- Next.js チーム - 素晴らしいフレームワーク

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/Meguroman1978/slide_generator/issues) でお知らせください。

---

Made with ❤️ by AI Presentation Generator Team
