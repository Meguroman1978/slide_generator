# 画像生成機能ガイド

## 📸 **画像生成・挿入機能の概要**

AI Presentation Generatorは、プレゼンテーションスライドに自動的に画像を生成・挿入する機能を提供します。

### サポートされる画像タイプ

1. **会社ロゴ** - Web検索による自動取得
2. **イラスト** - nano banana-proによるAI生成
3. **チャート/図表** - ideogram V_3による AI生成
4. **写真** - Web検索による取得

## 🎨 **画像生成の優先順位**

システムは以下の順序で画像を取得します:

1. **アップロード済みリソース** - ユーザーがアップロードした画像を最優先
2. **AI生成画像** - nano banana-pro / ideogram V_3による自動生成
3. **Web検索画像** - インターネットからの検索

## 🔧 **技術的な実装**

### 使用するAIモデル

#### イラスト生成
- **モデル**: `nano-banana-pro`
- **用途**: ビジネスイラスト、アイコン、概念図
- **特徴**: 高品質、プロフェッショナルなスタイル

#### チャート/図表生成
- **モデル**: `ideogram/V_3`
- **用途**: データビジュアライゼーション、フローチャート、組織図
- **特徴**: テキストレンダリングが優れている、明確なデータ表現

### APIエンドポイント

#### 画像生成API
```
POST /api/media/generate-image
```

**リクエストボディ**:
```json
{
  "query": "ビジネスプロフェッショナルが会議している写真",
  "model": "nano-banana-pro",
  "aspectRatio": "16:9",
  "imageType": "illustration"
}
```

**レスポンス**:
```json
{
  "success": true,
  "imageUrl": "https://...",
  "model": "nano-banana-pro",
  "query": "...",
  "imageType": "illustration"
}
```

#### ロゴ検索API
```
POST /api/media/search-logo
```

**リクエストボディ**:
```json
{
  "companyName": "サンプル株式会社",
  "searchQuery": "サンプル株式会社 ロゴ 公式"
}
```

#### 一般画像検索API
```
POST /api/media/search-image
```

**リクエストボディ**:
```json
{
  "query": "東京タワー 夕景"
}
```

## 🚀 **使用方法**

### 1. 基本的な使い方

#### アプリケーション側
プレゼンテーション生成時に、システムが自動的に画像を生成・挿入します:

```typescript
import { processImagesForSlides } from '@/lib/media/image-service';

// スライドデータと会社名を渡すだけ
const imageMap = await processImagesForSlides(
  slides,
  uploadedResources,
  settings.companyName
);
```

#### Google Apps Script側
受け取った画像URLをスライドに挿入:

```javascript
function insertImageToSlide(slide, imageUrl, position) {
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      const image = slide.insertImage(imageUrl, position.x, position.y, position.width, position.height);
      return image;
    } catch (error) {
      Logger.log('Error inserting image: ' + error);
      return null;
    }
  }
  return null;
}
```

### 2. カスタム画像の使用

#### アップロード済みリソースの優先使用

ユーザーがアップロードした画像は自動的に最優先で使用されます:

```typescript
// アップロードされた画像から関連画像を検索
const matchedResource = findMatchingImageInResources(
  uploadedResources,
  '会社ロゴ'
);

if (matchedResource) {
  // アップロード済み画像を使用
  imageUrl = matchedResource.url;
}
```

### 3. 画像生成のプロンプト強化

システムが自動的にプロンプトを強化します:

#### イラストの場合
```
元のクエリ: "チームミーティング"
強化後: "Professional business illustration: チームミーティング. High quality, corporate style, suitable for presentation slides, clean design, modern aesthetic."
```

#### チャートの場合
```
元のクエリ: "売上推移グラフ"
強化後: "Professional business chart or diagram: 売上推移グラフ. Clear data visualization, clean layout, suitable for presentation slides, professional color scheme, easy to understand."
```

## 🔄 **画像生成フロー**

```
1. スライド詳細生成
   ↓
2. レイアウト要素から画像要求を抽出
   ↓
3. アップロード済みリソースを検索
   ├─ 見つかった → そのまま使用
   └─ なし → 次のステップへ
   ↓
4. 画像タイプに応じたAIモデル選択
   ├─ イラスト → nano-banana-pro
   ├─ チャート → ideogram/V_3
   └─ 写真 → Web検索
   ↓
5. 画像生成/検索実行
   ↓
6. Google Apps Scriptに送信
   ↓
7. スライドに挿入
```

## 🎯 **現在の実装状況**

### ✅ 完了している機能

1. **画像サービスアーキテクチャ**
   - `lib/media/image-service.ts` - 画像処理のコアロジック
   - 優先順位ベースの画像取得システム

2. **APIエンドポイント**
   - `/api/media/generate-image` - AI画像生成
   - `/api/media/search-logo` - ロゴ検索
   - `/api/media/search-image` - 一般画像検索

3. **Google Apps Script統合準備**
   - 画像URL受信機能
   - スライドへの画像挿入機能

### 🚧 実装が必要な機能

1. **GenSpark image_generation ツール統合**
   - 現在はプレースホルダーレスポンスを返す
   - 実際のツール呼び出しが必要

2. **image_search ツール統合**
   - Web検索機能の完全実装
   - ロゴ検索の実装

3. **画像キャッシング**
   - 生成済み画像の再利用
   - パフォーマンス最適化

## 🔨 **GenSparkツール統合の方法**

### image_generation ツールの使用

理想的な実装例:

```typescript
import { image_generation } from '@/tools/image-generation';

async function generateIllustration(query: string, aspectRatio: string) {
  const result = await image_generation({
    query: `Professional business illustration: ${query}. High quality, corporate style.`,
    model: 'nano-banana-pro',
    aspect_ratio: aspectRatio,
    image_urls: [],
    task_summary: `Generate illustration for presentation: ${query}`
  });

  return {
    url: result.generated_images[0].url,
    source: 'ai-generated',
    description: query
  };
}
```

### image_search ツールの使用

```typescript
import { image_search } from '@/tools/image-search';

async function searchCompanyLogo(companyName: string) {
  const result = await image_search({
    query: `${companyName} ロゴ 公式 logo high resolution`
  });

  return {
    url: result.images[0].url,
    source: 'web-search',
    description: `${companyName} logo`
  };
}
```

## 🐛 **トラブルシューティング**

### 問題1: 画像が生成されない

**原因**: GenSparkツールが統合されていない

**解決方法**:
1. `image_generation` ツールを統合
2. APIキーが正しく設定されているか確認
3. エラーログを確認

### 問題2: 画像URLエラー (Invalid URL)

**原因**: サーバーサイドで相対URLを使用している

**解決方法**:
- ✅ **修正済み**: `lib/media/image-service.ts` で絶対URLを使用
- 環境変数 `NEXT_PUBLIC_API_BASE_URL` が正しく設定されているか確認

### 問題3: ロゴが見つからない

**原因**: Web検索機能が未実装

**解決方法**:
1. `image_search` ツールを統合
2. または外部API (Clearbit Logo API など) を使用
3. デフォルトのプレースホルダー画像を用意

## 📈 **今後の改善計画**

### 短期 (1-2週間)
1. GenSpark `image_generation` ツールの完全統合
2. GenSpark `image_search` ツールの完全統合
3. エラーハンドリングの強化

### 中期 (1-2ヶ月)
1. 画像キャッシングシステムの実装
2. 画像最適化（サイズ、フォーマット）
3. プレビュー機能の追加

### 長期 (3ヶ月以上)
1. カスタムスタイルの学習
2. ブランドガイドライン自動適用
3. インタラクティブな画像編集機能

## 🆘 **サポートとフィードバック**

画像生成機能に関する質問や問題がある場合:

1. **ログを確認**: サーバーログとGoogle Apps Scriptログ
2. **エラーメッセージ**: 詳細なエラー情報を取得
3. **環境変数**: API設定が正しいか確認

---

**更新日**: 2025-11-29  
**バージョン**: 1.0  
**ドキュメント作成者**: AI Presentation Generator Team
