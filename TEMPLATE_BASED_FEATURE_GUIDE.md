# テンプレートベースのスライド生成機能 - 完全ガイド

## 🎉 実装完了機能

### 1. **テンプレート変数の動的置換**
以下の変数がテンプレート内で自動的に置換されます:

#### **基本変数**
- `{{Company Name}}`: 会社名/ブランド名
  - 社外向け資料: 入力された会社名
  - 社内向け資料: 「社内向け資料」と表示

- `{{Company Logo}}`: 会社ロゴ
  - Web検索から自動取得
  - 画像プレースホルダーとして配置

- `{{Slide Theme}}`: スライドテーマ
  - プレゼンテーションのタイトル

- `{{YYYY/MM/DD}}`: 生成日
  - 自動的に現在の日付を挿入（例: 2025/11/29）

- `{{Agenda}}`: 目次
  - 全スライドのタイトルを自動的にリスト化

#### **スライド個別変数**
- `{{Each Agenda}}`: 各アジェンダ項目
  - 各スライドのタイトル

- `{{Key Message}}`: キーメッセージ
  - 各スライドの重要なメッセージ

- `{{Content}}`: コンテンツ
  - スライドの詳細内容

- `{{Image}}`: 画像
  - AI生成イラスト（nano-banana-pro）
  - AI生成チャート（gemini/veo3）
  - アップロードされた既存画像（優先）
  - Web検索画像

---

## 🚀 使い方

### **Step 1: テンプレートを準備**
デフォルトテンプレート: 
```
https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpBbhcSTUhGX3WrI5Q/edit
```

テンプレートスライドには以下の変数を配置:
- カバースライド: `{{Company Name}}`, `{{Company Logo}}`, `{{Slide Theme}}`, `{{YYYY/MM/DD}}`
- アジェンダスライド: `{{Agenda}}`
- コンテンツスライド: `{{Each Agenda}}`, `{{Key Message}}`, `{{Content}}`, `{{Image}}`

### **Step 2: 設定画面で資料タイプを選択**

#### 社外向け資料の場合:
1. 「設定」→「デザイン設定」を開く
2. 「対象オーディエンス」で「**社外向け資料**」を選択
3. 「**会社名/ブランド名**」を入力（例: 株式会社サンプル）
4. （オプション）「テンプレートURL」にカスタムテンプレートURLを入力

#### 社内向け資料の場合:
1. 「設定」→「デザイン設定」を開く
2. 「対象オーディエンス」で「**社内向け資料**」を選択
3. テンプレート変数には自動的に「社内向け資料」と表示されます

### **Step 3: Google Apps Scriptをデプロイ**

#### 新しいGoogle Apps Scriptのデプロイ手順:

1. **プロジェクトにアクセス:**
   ```
   https://script.google.com/home/projects/1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn/edit
   ```

2. **新しいコードをコピー:**
   - `apps-script/Code-Template-Enhanced.gs` の内容をコピー
   - プロジェクトの `Code.gs` に貼り付け

3. **デプロイ:**
   - 「デプロイ」→「新しいデプロイ」を選択
   - 「タイプの選択」→「ウェブアプリ」を選択
   - **重要:** 「アクセスできるユーザー」を「**全員**」に設定
   - 「デプロイ」をクリック

4. **URLを取得:**
   - 生成されたURLをコピー（`https://script.google.com/macros/s/...`）

5. **アプリに設定:**
   - 設定画面 → API設定
   - 「Google Apps Script URL」に貼り付け

### **Step 4: テスト**

#### curlでテスト:
```bash
curl -X GET "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

期待される結果:
```json
{
  "status": "ok",
  "message": "AI Presentation Generator - Template-Based Enhanced Version",
  "version": "3.0",
  "features": [
    "Template copying and variable replacement",
    "Dynamic {{Company Name}}, {{Company Logo}}, ... support",
    "Multiple agenda slide generation",
    "Image insertion support",
    "External/internal material type support"
  ],
  "timestamp": "2025-11-29T..."
}
```

---

## 🎨 画像生成の優先順位

1. **アップロードされた既存ファイル** (最優先)
   - ユーザーがアップロードした画像を検索
   - キーワードマッチングで関連画像を自動選択

2. **AI生成イラスト** (nano-banana-pro)
   - イラスト、アイコン、装飾的な画像に使用
   - 高品質、スタイリッシュなビジュアル

3. **AI生成チャート** (gemini/veo3)
   - グラフ、チャート、データビジュアライゼーションに使用
   - データドリブンな視覚化

4. **Web検索画像**
   - 写真、実物の画像に使用
   - フォールバックオプション

---

## 📋 技術仕様

### **Google Apps Script機能**
- **テンプレートコピー:** `DriveApp.makeCopy()`
- **変数置換:** 正規表現ベースの全テキスト置換
- **画像挿入:** `slide.insertImage(url, x, y, width, height)`
- **複数スライド生成:** テンプレートスライドの複製と個別変数置換

### **Next.js API統合**
- **画像検索API:** `/api/media/search-logo`, `/api/media/search-image`
- **画像生成API:** `/api/media/generate-image`
- **エクスポートAPI:** `/api/export/google-slides` (メタデータ拡張)

### **状態管理**
- **Zustand Store:** `audienceType`, `companyName` を追加
- **型定義:** `AudienceType = 'external' | 'internal'`

---

## 🔧 トラブルシューティング

### **問題: テンプレートが正しくコピーされない**
**解決策:**
- テンプレートURLが正しいか確認
- テンプレートが「リンクを知っている全員が閲覧可能」に設定されているか確認
- Google Apps Scriptのエラーログを確認（`Logger.log`）

### **問題: 変数が置換されない**
**解決策:**
- テンプレート内の変数名が完全一致するか確認（例: `{{Company Name}}` は大文字小文字区別）
- 設定画面で必要な情報（会社名など）が入力されているか確認

### **問題: 画像が表示されない**
**解決策:**
- 画像URLが有効か確認
- 画像ファイルが公開アクセス可能か確認
- Google Apps Scriptで画像挿入エラーログを確認

### **問題: 401エラーが発生する**
**解決策:**
- Google Apps Scriptのデプロイ設定を確認
- 「アクセスできるユーザー」が「**全員**」になっているか確認
- デプロイを削除して新しくデプロイ

---

## 🎯 使用例

### **営業資料（社外向け）の作成:**
```
設定:
- 対象オーディエンス: 社外向け資料
- 会社名: ABC株式会社
- テンプレートURL: デフォルト

結果:
- {{Company Name}} → "ABC株式会社"
- {{Company Logo}} → ABC社のロゴ（Web検索）
- {{YYYY/MM/DD}} → "2025/11/29"
- 各スライドに会社ロゴとブランディング要素が挿入される
```

### **社内報告資料（社内向け）の作成:**
```
設定:
- 対象オーディエンス: 社内向け資料
- テンプレートURL: デフォルト

結果:
- {{Company Name}} → "社内向け資料"
- {{Company Logo}} → デフォルトアイコン
- 社内向けのカジュアルなトーン
```

---

## 📦 ファイル構成

```
/home/user/webapp/
├── apps-script/
│   ├── Code-Enhanced.gs          # 既存の拡張版
│   └── Code-Template-Enhanced.gs # 新しいテンプレートベース版 ⭐
├── app/api/
│   ├── export/google-slides/
│   │   └── route.ts              # メタデータ拡張済み ⭐
│   └── media/
│       ├── search-logo/route.ts  # ロゴ検索API ⭐
│       ├── search-image/route.ts # 画像検索API ⭐
│       └── generate-image/route.ts # 画像生成API ⭐
├── lib/
│   ├── media/
│   │   └── image-service.ts      # 画像サービスユーティリティ ⭐
│   └── stores/
│       └── presentationStore.ts  # 状態管理（拡張済み）
├── components/
│   └── SettingsDialog.tsx        # 設定UI（拡張済み）
└── types/
    └── index.ts                  # 型定義（拡張済み）
```

---

## ✅ 完了したタスク

1. ✅ Google Apps Scriptのテンプレート変数置換機能
2. ✅ 会社ロゴ検索API実装
3. ✅ 画像生成・検索API実装
4. ✅ エクスポートAPIのメタデータ拡張
5. ✅ 社外向け/社内向け資料の選択UI
6. ✅ 会社名入力フィールド
7. ✅ autocomplete属性の設定（パスワード保存ダイアログ抑制）
8. ✅ 画像優先順位の実装（アップロード > AI生成 > Web検索）

---

## 🎓 次のステップ

1. **Google Apps Scriptを更新:**
   - 新しい `Code-Template-Enhanced.gs` をデプロイ
   - URLを取得してアプリに設定

2. **エンドツーエンドテスト:**
   - 社外向け資料を作成
   - 社内向け資料を作成
   - テンプレート変数が正しく置換されるか確認
   - 画像が正しく挿入されるか確認

3. **本番環境デプロイ:**
   - すべての機能が正常に動作することを確認
   - ユーザーに新機能をアナウンス

---

## 📞 サポート

問題が発生した場合:
1. ブラウザのコンソールログを確認
2. Google Apps Scriptのログを確認（`View > Logs`）
3. 設定が正しく保存されているか確認
4. デモURL: `https://3008-isc74kp5hxf1e5sjpc12t-a402f90a.sandbox.novita.ai`

---

**作成日:** 2025-11-29  
**バージョン:** 3.0  
**機能:** テンプレートベースのスライド生成 + 動的変数置換 + 画像自動挿入
