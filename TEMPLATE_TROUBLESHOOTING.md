# テンプレート問題のトラブルシューティングガイド

## 🔴 **問題: テンプレートが使われない**

### 症状
- 生成されたGoogle Slidesが、指定したテンプレートのデザイン（背景、フォント、色）を使用していない
- 白い背景の新しいプレゼンテーションが作成される
- 変数（`{{Company Name}}`など）がそのまま表示される

### 原因
Google Apps Scriptのデプロイバージョンが古く、テンプレートコピー機能を含んでいない可能性があります。

## ✅ **解決手順**

### ステップ1: Google Apps Scriptプロジェクトを開く

1. 以下のURLにアクセス:
   ```
   https://script.google.com/home/projects/1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn/edit
   ```

2. Googleアカウントでログインしていることを確認

### ステップ2: コードを更新

1. 左側のファイル一覧で `Code.gs` ファイルを選択

2. 現在のコードの**バージョンを確認**:
   - ファイルの先頭に `AI Presentation Generator - Template-Based Google Apps Script (v3.0)` と表示されていますか？
   - もし `v3.0` と表示されていない、または異なるバージョン番号の場合、更新が必要です

3. このリポジトリの `apps-script/Code-Template-Enhanced.gs` を開く

4. `Code-Template-Enhanced.gs` の内容を**すべてコピー**

5. `Code.gs` の内容を**すべて削除**

6. コピーした内容を貼り付け

7. 💾 **保存ボタンをクリック**（Ctrl+S または上部の保存アイコン）

### ステップ3: デプロイを更新

#### 方法A: 既存のデプロイを更新（推奨）

1. 右上の「デプロイ」ボタンをクリック

2. 「デプロイを管理」を選択

3. 既存のデプロイの右側にある「編集」アイコン（鉛筆マーク）をクリック

4. **「バージョン」ドロップダウンで「新バージョン」を選択**

5. 説明フィールドに `v3.0 - Template support added` と入力

6. 「デプロイ」ボタンをクリック

7. ✅ **同じURLが表示されますが、スクリプトは更新されています**

#### 方法B: 新しいデプロイを作成

1. 右上の「デプロイ」ボタンをクリック

2. 「新しいデプロイ」を選択

3. デプロイタイプで「ウェブアプリ」を選択

4. 設定:
   - **説明**: `Template-Based Generator v3.0`
   - **次のユーザーとして実行**: `自分` (Me)
   - **アクセスできるユーザー**: `全員` (Anyone)

5. 「デプロイ」をクリック

6. **新しいウェブアプリURLをコピー**

7. アプリケーションの設定画面で、新しいURLに更新

### ステップ4: 動作確認

1. デモアプリを開く: `https://3010-isc74kp5hxf1e5sjpc12t-a402f90a.sandbox.novita.ai`

2. テストファイルをアップロードして、プレゼンテーションを生成

3. 生成されたGoogle Slidesを確認:
   - ✅ テンプレートのデザイン（背景、色、フォント）が適用されているか？
   - ✅ `{{Company Name}}` などの変数が正しく置換されているか？
   - ✅ アジェンダスライドが自動生成されているか？

### ステップ5: ログの確認（デバッグ）

Google Apps Scriptの実行ログを確認する方法:

1. Google Apps Scriptエディタで、左側の「実行数」をクリック

2. 最新の実行を選択

3. ログを確認:
   ```
   === RECEIVED DATA DEBUG ===
   data.metadata.templateUrl: https://docs.google.com/presentation/d/...
   Final templateUrl: https://docs.google.com/presentation/d/...
   ===========================
   Using template: https://docs.google.com/presentation/d/...
   Template copied successfully: [new-presentation-id]
   ```

4. もし `WARNING: Creating presentation without template` というメッセージが表示されている場合:
   - テンプレートURLが正しく送信されていない
   - またはGoogle Apps Scriptが古いバージョンである

## 🔍 **詳細な診断**

### アプリケーション側の確認

サーバーログ（ターミナル）で以下のメッセージを探します:

```
Using template URL: https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpJbhcSTUhGX3WrI5Q/edit
Calling Google Apps Script URL: https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec
Response status: 200
```

✅ このログが表示されている場合、アプリケーション側は正しく動作しています。

### Google Apps Script側の確認

1. Google Apps Scriptエディタを開く

2. `Code.gs` ファイルの先頭を確認:
   ```javascript
   /**
    * AI Presentation Generator - Template-Based Google Apps Script (v3.0)
    * 
    * テンプレートベースのプレゼンテーション生成システム
    * ...
    */
   ```

3. `doPost` 関数内に以下のコードがあることを確認:
   ```javascript
   var templateUrl = data.metadata.templateUrl || (data.metadata.settings ? data.metadata.settings.templateUrl : null);
   
   if (templateUrl) {
     Logger.log('Using template: ' + templateUrl);
     presentation = copyTemplatePresentation(templateUrl, data.metadata.title);
     // ...
   }
   ```

4. `copyTemplatePresentation` 関数が存在することを確認

## 🚨 **よくある問題と解決方法**

### 問題1: デプロイURLが変わってしまった

**解決方法**: 
- アプリケーションの設定画面で新しいURLに更新
- または、古いデプロイを「編集」して新バージョンで更新（URLは変わらない）

### 問題2: 権限エラーが表示される

**解決方法**:
1. デプロイ設定で「アクセスできるユーザー」を「全員」に設定
2. 「次のユーザーとして実行」を「自分」に設定
3. 初回実行時に権限を許可

### 問題3: テンプレートが見つからないエラー

**解決方法**:
1. テンプレートURLが正しいか確認
2. テンプレートファイルの共有設定を確認（「リンクを知っている全員」に設定）
3. Google Apps Scriptを実行するアカウントがテンプレートにアクセスできるか確認

### 問題4: 変数が置換されない

**解決方法**:
1. テンプレート内の変数が正しい形式（`{{Company Name}}`）で記述されているか確認
2. Google Apps Scriptが最新版（v3.0）に更新されているか確認
3. `replaceTemplateVariables` 関数が実行されているかログで確認

## 📊 **成功の確認ポイント**

### ✅ 正しく動作している場合

1. **生成されたスライド**:
   - テンプレートのデザインが適用されている
   - 背景色や画像がテンプレートと一致
   - フォントスタイルがテンプレートと一致

2. **変数の置換**:
   - `{{Company Name}}` → 実際の会社名
   - `{{YYYY/MM/DD}}` → 現在の日付
   - `{{Agenda}}` → アジェンダ一覧

3. **スライド構成**:
   - カバースライド
   - アジェンダスライド
   - 各コンテンツスライド
   - まとめスライド

4. **サーバーログ**:
   ```
   Using template URL: [template-url]
   Calling Google Apps Script URL: [gas-url]
   Response status: 200
   ```

5. **Google Apps Script実行ログ**:
   ```
   Using template: [template-url]
   Template copied successfully: [new-id]
   ```

### ❌ まだ問題がある場合

1. **白い背景のスライドが生成される**:
   - Google Apps Scriptが更新されていない
   - デプロイが古いバージョン

2. **変数がそのまま表示される**:
   - `replaceTemplateVariables` 関数が実行されていない
   - テンプレート内の変数形式が正しくない

3. **エラーメッセージが表示される**:
   - 実行ログを確認
   - エラーメッセージをコピーして調査

## 🆘 **サポート情報**

問題が解決しない場合は、以下の情報を提供してください:

1. **Google Apps Script実行ログ**（スクリーンショット）
2. **アプリケーションサーバーログ**（関連部分）
3. **生成されたGoogle SlidesのURL**
4. **使用したテンプレートのURL**
5. **エラーメッセージ**（あれば）

---

**更新日**: 2025-11-29  
**バージョン**: v3.0  
**ドキュメント作成者**: AI Presentation Generator Team
