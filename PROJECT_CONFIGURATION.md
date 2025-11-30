# 🔐 プロジェクト設定情報

このファイルには、プロジェクトの重要な設定情報が記録されています。

---

## 📋 Google Apps Script 情報

### プロジェクトURL
```
https://script.google.com/home/projects/1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn/edit
```

### 最新デプロイURL（2025-11-29更新）
```
https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec
```

### デプロイ設定
```
種類: ウェブアプリ
次のユーザーとして実行: 自分
アクセスできるユーザー: 全員  ← 必須！
```

### ⚠️ 重要な注意事項

**現在の状態**: このURLはまだ正しく動作していません。

**問題**: 認証リダイレクトが発生しています（302 Redirect）

**原因**: デプロイ設定で「アクセスできるユーザー」が「全員」になっていない可能性があります。

**解決方法**:
1. プロジェクトURLを開く（上記参照）
2. 「デプロイ」→「デプロイを管理」
3. 最新のデプロイを編集
4. **「アクセスできるユーザー」を「全員」に設定**
5. 「デプロイを更新」
6. 以下のコマンドでテスト:
   ```bash
   curl -X GET "https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec"
   ```
7. JSONレスポンスが返れば成功

### テスト方法

#### 正常な応答（期待される結果）
```json
{
  "status": "ok",
  "message": "AI Presentation Generator - Google Apps Script is running",
  "timestamp": "2025-11-29T12:00:00.000Z"
}
```

#### エラー応答（現在の状態）
```html
<HTML>
<HEAD>
<TITLE>Moved Temporarily</TITLE>
...
```

---

## 🔑 API Keys

すべてのAPI Keyは `.env.local` ファイルにセキュアに保存されています。

### Google AI Studio API Key
- **用途**: Gemini API（優先使用）
- **モデル**: `gemini-2.0-flash-exp`
- **保存場所**: `.env.local` の `GOOGLE_AI_STUDIO_API_KEY`
- **フォールバック**: OpenAI API

### OpenAI API Key
- **用途**: GPT-4o（Geminiフォールバック時）
- **保存場所**: `.env.local` の `OPENAI_API_KEY`

### Google Apps Script URL
- **用途**: Google Slidesエクスポート
- **保存場所**: `.env.local` の `GOOGLE_APPS_SCRIPT_URL`
- **ユーザー設定**: アプリの設定画面で上書き可能

---

## 🌐 環境変数の管理

### .env.local ファイル
```bash
# Google AI Studio API Key (デフォルト - 優先使用)
GOOGLE_AI_STUDIO_API_KEY=AIzaSyCF3_TzsBIkBfhgA90DXKin-flmH7hpqfk

# OpenAI API Key (デフォルト - フォールバック)
OPENAI_API_KEY=sk-proj-AZAgplTV...（セキュリティのため省略）

# Google Apps Script URL (デフォルト - 最新デプロイ)
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec
```

### ユーザー設定の優先順位
1. **ユーザー入力**（アプリの設定画面）
2. **環境変数**（.env.local）
3. **エラー**（両方とも未設定の場合）

---

## 📚 セットアップドキュメント

### デプロイ関連
- **YOUR_SPECIFIC_SETUP_GUIDE.md**: あなた専用の詳細セットアップガイド
- **TROUBLESHOOTING_401.md**: 401エラー完全解決ガイド
- **GOOGLE_APPS_SCRIPT_SETUP.md**: Apps Script一般セットアップガイド

### 機能説明
- **COMPLETE_SOLUTION_GUIDE.md**: すべての機能の完全ガイド
- **README.md**: プロジェクト概要

---

## 🔄 URL変更履歴

### 2025-11-29
- **新URL**: `AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q`
- **状態**: 認証リダイレクト発生中（要設定確認）
- **アクション**: デプロイ設定の「アクセスできるユーザー」を「全員」に変更

### 以前のURL（参考）
- `AKfycbwYw9agkH9pig0IkksI2KDrP1rmekCKrFA0vtw8xe6K5nznEkYb1LeWRxRS9F0vkBxKXA`（認証エラー）

---

## ✅ 次のステップ

1. **Google Apps Scriptの設定を確認**:
   - プロジェクトURL: https://script.google.com/home/projects/1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn/edit
   - 「デプロイ」→「デプロイを管理」
   - **「アクセスできるユーザー」を「全員」に設定**

2. **URLをテスト**:
   ```bash
   curl -X GET "https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec"
   ```

3. **成功を確認**:
   - JSONレスポンスが返ってくること
   - HTMLリダイレクトが発生しないこと

4. **アプリで使用**:
   - デモURL: https://3005-isc74kp5hxf1e5sjpc12t-a402f90a.sandbox.novita.ai
   - 設定画面でURLが正しく設定されていることを確認
   - エンドツーエンドテスト

---

## 🔒 セキュリティ

- `.env.local` ファイルは `.gitignore` に追加済み（Gitに含まれない）
- API Keyは環境変数として安全に管理
- ユーザー入力のAPI Keyは設定がクリアされるまで優先使用
- Google Apps Script URLも環境変数で管理

---

## 📞 サポート

問題が発生した場合:
1. `YOUR_SPECIFIC_SETUP_GUIDE.md` の詳細手順を確認
2. `TROUBLESHOOTING_401.md` のトラブルシューティングを確認
3. curlコマンドでURLをテスト
4. エラーメッセージを確認

---

**最終更新**: 2025-11-29
**プロジェクトID**: 1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn
**最新デプロイID**: AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q
