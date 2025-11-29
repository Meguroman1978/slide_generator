# API キー設定ガイド

このガイドでは、AI Presentation Generatorを使用するために必要なAPIキーの取得方法を説明します。

## 📋 目次

1. [OpenAI API Key（必須）](#openai-api-key必須)
2. [Anthropic API Key（オプション）](#anthropic-api-keyオプション)
3. [Google Apps Script URL（スライド生成用）](#google-apps-script-urlスライド生成用)

---

## OpenAI API Key（必須）

OpenAI APIは、ファイル分析、ストーリーライン生成、スライド生成に使用されます。

### ステップ1: アカウント作成

1. [OpenAI Platform](https://platform.openai.com/signup) にアクセス
2. メールアドレスまたはGoogle/Microsoft アカウントでサインアップ
3. 電話番号を認証（SMS認証）

### ステップ2: API Key の作成

1. ログイン後、[API Keys ページ](https://platform.openai.com/api-keys) に移動
2. 「Create new secret key」ボタンをクリック
3. キーに名前を付ける（例: "AI Presentation Generator"）
4. 「Create secret key」をクリック
5. 表示されたキーを**必ずコピー**して保存（再表示できません）

```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ステップ3: アプリに設定

#### 方法1: 環境変数ファイル（推奨）

`.env.local` ファイルに追加:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 方法2: UI設定画面

1. アプリの「設定」ボタンをクリック
2. 「API 設定」タブを選択
3. 「OpenAI API Key」フィールドに貼り付け
4. 自動的に保存されます（ローカルストレージ）

### 料金について

- **無料枠**: 新規アカウントには$5のクレジット付与
- **従量課金**: GPT-4o の場合
  - 入力: $2.50 / 1M tokens
  - 出力: $10.00 / 1M tokens
- プレゼンテーション1つあたり約 $0.50-2.00 程度

詳細: [OpenAI Pricing](https://openai.com/api/pricing/)

---

## Anthropic API Key（オプション）

Anthropic Claude APIは、OpenAIの代替として使用できます（今後のアップデートで対応予定）。

### ステップ1: アカウント作成

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. メールアドレスでサインアップ
3. 認証コードを確認

### ステップ2: API Key の作成

1. ログイン後、「API Keys」セクションに移動
2. 「Create Key」をクリック
3. キーに名前を付ける
4. 表示されたキーをコピーして保存

```
sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ステップ3: アプリに設定

`.env.local` に追加:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

または、UI設定画面の「Anthropic API Key」フィールドに入力。

### 料金について

- **無料枠**: なし（クレジットカード登録が必要）
- **従量課金**: Claude 3.5 Sonnet の場合
  - 入力: $3.00 / 1M tokens
  - 出力: $15.00 / 1M tokens

詳細: [Anthropic Pricing](https://www.anthropic.com/api)

---

## Google Apps Script URL（スライド生成用）

Google Slidesへの直接出力には、Apps Scriptのデプロイが必要です。

### ステップ1: Apps Script プロジェクト作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクトに名前を付ける（例: "AI Presentation Generator"）

### ステップ2: コードを追加

1. `Code.gs` ファイルを開く
2. デフォルトのコードを削除
3. `apps-script/Code.gs` の内容を**すべてコピー**して貼り付け
4. 「プロジェクトを保存」をクリック（💾アイコン）

### ステップ3: デプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「タイプの選択」で⚙️アイコンから「ウェブアプリ」を選択
3. 設定を以下のように変更:
   - **説明**: "AI Presentation Generator API"
   - **次のユーザーとして実行**: 「自分」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」をクリック
5. 「アクセスを承認」をクリックして権限を付与
6. 表示された「ウェブアプリのURL」をコピー

```
https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
```

### ステップ4: アプリに設定

`.env.local` に追加:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

または、UI設定画面の「Google Apps Script URL」フィールドに入力。

### 権限について

初回実行時に以下の権限が必要です:

- **Google Slides**: プレゼンテーションの作成と編集
- **Google Drive**: ファイルの保存

これらの権限は、スライド生成のために必要です。

### トラブルシューティング

#### エラー: "承認が必要です"

1. Apps Script プロジェクトを開く
2. 「実行」→「doPost」を選択
3. 権限の承認画面が表示されたら承認

#### エラー: "スクリプトが見つかりません"

1. デプロイ設定を確認
2. 「アクセスできるユーザー」が「全員」になっているか確認
3. 再度デプロイ

---

## 🔒 セキュリティのベストプラクティス

### API Keyの保護

- ✅ `.env.local` ファイルは `.gitignore` に含める（デフォルトで設定済み）
- ✅ API Keyを公開リポジトリにコミットしない
- ✅ 定期的にキーをローテーション
- ✅ 不要になったキーは削除

### ローカルストレージ

UIから設定したAPI Keyは、ブラウザのローカルストレージに保存されます:

- ✅ サーバーには送信されない
- ✅ HTTPSで暗号化された通信のみ
- ✅ 他のウェブサイトからはアクセス不可

### 使用量の監視

- OpenAI: [Usage Dashboard](https://platform.openai.com/usage)
- Anthropic: Console の「Usage」セクション
- 使用量制限の設定を推奨

---

## ❓ よくある質問

### Q: API Keyが漏洩した場合はどうすればいい？

A: すぐに以下を実行してください:
1. 該当するプラットフォーム（OpenAI/Anthropic）でキーを無効化
2. 新しいキーを生成
3. アプリの設定を更新

### Q: 無料で使えますか？

A: 
- OpenAI: 新規アカウントに$5のクレジット付与（3ヶ月有効）
- 以降は従量課金（プレゼンテーション1つあたり約$0.50-2.00）

### Q: エラーが出る場合は？

A: 以下を確認してください:
1. API Keyが正しく設定されているか
2. API Keyが有効か（期限切れや無効化されていないか）
3. 使用量制限に達していないか
4. インターネット接続が正常か

### Q: Google Apps Script を使わずにスライドを生成できますか？

A: はい、PowerPoint (PPTX) 形式でのエクスポートも可能です（今後のアップデートで実装予定）。

---

## 📞 サポート

設定に問題がある場合は、[GitHub Issues](https://github.com/Meguroman1978/slide_generator/issues) でお知らせください。

---

最終更新: 2024年11月
