# 📝 テンプレート変数置換機能 実装ガイド

## 🎯 要件まとめ

### 1. デフォルトテンプレート
```
https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpJbhcSTUhGX3WrI5Q/edit
```

### 2. 置換する変数

| 変数 | 説明 | 条件 |
|------|------|------|
| `{{Company Name}}` | 会社名/ブランド名 | 社外向け: 入力値、社内向け: "社内向け資料" |
| `{{Company Logo}}` | 会社ロゴ | 社外向け: ロゴ検索+挿入、社内向け: "社内向け資料"テキスト |
| `{{Slide Theme}}` | スライドテーマ | ドラフトのthemeフィールド |
| `{{YYYY/MM/DD}}` | 生成日付 | 現在日時（YYYY/MM/DD形式） |
| `{{Agenda}}` | 目次 | 各スライドの見出しリスト |
| `{{Each Agenda}}` | 個別アジェンダ | 各スライドのタイトル |
| `{{Key Message}}` | キーメッセージ | 各スライドのkeyMessage |
| `{{Content}}` | コンテンツ | 各スライドのlayout要素を整形 |
| `{{Image}}` | 画像 | AIで生成またはアップロード画像から選択 |

### 3. 画像生成推奨モデル
- **イラスト**: `nano-banana-pro`（Gemini Nano Banana Pro）
- **チャート**: `gemini/veo3`（Gemini 3）
- **優先順位**: アップロードされた画像 > AI生成

---

## 🏗️ 実装アーキテクチャ

### Google Apps Script側の実装

```javascript
/**
 * テンプレートベースのプレゼンテーション生成
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // テンプレートURLがあればコピー、なければ新規作成
    var presentation;
    if (data.metadata.settings.templateUrl) {
      presentation = copyTemplate(data.metadata.settings.templateUrl, data.metadata.title);
    } else {
      presentation = SlidesApp.create(data.metadata.title);
    }
    
    var presentationId = presentation.getId();
    
    // 変数置換データを準備
    var replacements = prepareReplacements(data);
    
    // すべてのスライドで変数を置換
    replaceVariablesInPresentation(presentation, replacements);
    
    // 個別アジェンダスライドを生成
    generateAgendaSlides(presentation, data, replacements);
    
    // 画像を挿入
    insertImages(presentation, data);
    
    return createJsonResponse({
      success: true,
      presentationId: presentationId,
      url: presentation.getUrl()
    });
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * テンプレートをコピー
 */
function copyTemplate(templateUrl, newTitle) {
  // URLからプレゼンテーションIDを抽出
  var templateId = extractPresentationId(templateUrl);
  
  // テンプレートをコピー
  var templateFile = DriveApp.getFileById(templateId);
  var copiedFile = templateFile.makeCopy(newTitle);
  
  return SlidesApp.openById(copiedFile.getId());
}

/**
 * プレゼンテーションIDを抽出
 */
function extractPresentationId(url) {
  var matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : null;
}

/**
 * 置換データを準備
 */
function prepareReplacements(data) {
  var settings = data.metadata.settings;
  var audienceType = settings.audienceType || 'external';
  var companyName = settings.companyName || '';
  
  // 会社名の決定
  var displayCompanyName = audienceType === 'external' ? companyName : '社内向け資料';
  
  // 日付フォーマット
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
  
  // アジェンダ作成
  var agenda = data.slides.map(function(slide) {
    return slide.title;
  }).join('\\n');
  
  return {
    'Company Name': displayCompanyName,
    'Slide Theme': data.draft.theme || 'プロフェッショナル',
    'YYYY/MM/DD': dateStr,
    'Agenda': agenda,
    audienceType: audienceType,
    companyName: companyName
  };
}

/**
 * プレゼンテーション全体で変数を置換
 */
function replaceVariablesInPresentation(presentation, replacements) {
  var slides = presentation.getSlides();
  
  slides.forEach(function(slide) {
    // テキストボックス内の変数を置換
    var shapes = slide.getShapes();
    shapes.forEach(function(shape) {
      if (shape.getShapeType() === SlidesApp.ShapeType.TEXT_BOX) {
        var textRange = shape.getText();
        replaceVariablesInText(textRange, replacements);
      }
    });
    
    // テーブル内の変数を置換
    var tables = slide.getTables();
    tables.forEach(function(table) {
      replaceVariablesInTable(table, replacements);
    });
  });
}

/**
 * テキスト内の変数を置換
 */
function replaceVariablesInText(textRange, replacements) {
  Object.keys(replacements).forEach(function(key) {
    var pattern = '{{' + key + '}}';
    textRange.replaceAllText(pattern, replacements[key]);
  });
}

/**
 * テーブル内の変数を置換
 */
function replaceVariablesInTable(table, replacements) {
  var numRows = table.getNumRows();
  var numCols = table.getNumColumns();
  
  for (var r = 0; r < numRows; r++) {
    for (var c = 0; c < numCols; c++) {
      var cell = table.getCell(r, c);
      var textRange = cell.getText();
      replaceVariablesInText(textRange, replacements);
    }
  }
}

/**
 * 個別アジェンダスライドを生成
 */
function generateAgendaSlides(presentation, data, replacements) {
  // 個別アジェンダ用スライド(slide id.g38490369bbf_0_19)を探す
  var slides = presentation.getSlides();
  var agendaTemplate = null;
  var agendaTemplateIndex = -1;
  
  // テンプレートスライドを探す（{{Each Agenda}}を含むスライド）
  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];
    var shapes = slide.getShapes();
    
    for (var j = 0; j < shapes.length; j++) {
      var text = shapes[j].getText().asString();
      if (text.indexOf('{{Each Agenda}}') !== -1) {
        agendaTemplate = slide;
        agendaTemplateIndex = i;
        break;
      }
    }
    if (agendaTemplate) break;
  }
  
  if (!agendaTemplate) {
    Logger.log('Agenda template not found');
    return;
  }
  
  // テンプレートスライドを削除（後で複製するため）
  var templateSlide = agendaTemplate;
  
  // 各アジェンダ用のスライドを生成
  data.slides.forEach(function(slideData, index) {
    if (slideData.templateType === 'cover' || slideData.templateType === 'section') {
      return; // カバーとセクションはスキップ
    }
    
    // テンプレートを複製
    var newSlide = templateSlide.duplicate();
    
    // 変数を置換
    var shapes = newSlide.getShapes();
    shapes.forEach(function(shape) {
      var textRange = shape.getText();
      textRange.replaceAllText('{{Each Agenda}}', slideData.title);
      textRange.replaceAllText('{{Key Message}}', slideData.keyMessage);
      textRange.replaceAllText('{{Content}}', formatContent(slideData.layout));
    });
    
    // スライドを適切な位置に移動
    presentation.moveSlide(newSlide, agendaTemplateIndex + index + 1);
  });
  
  // テンプレートスライドを削除
  templateSlide.remove();
}

/**
 * レイアウト要素をコンテンツテキストに整形
 */
function formatContent(layout) {
  if (!layout || layout.length === 0) {
    return 'コンテンツなし';
  }
  
  return layout
    .filter(function(element) { return element.type === 'text'; })
    .map(function(element) { return '• ' + element.content; })
    .join('\\n');
}

/**
 * 画像を挿入
 */
function insertImages(presentation, data) {
  var slides = presentation.getSlides();
  
  slides.forEach(function(slide, index) {
    if (index >= data.slides.length) return;
    
    var slideData = data.slides[index];
    var shapes = slide.getShapes();
    
    // {{Image}}プレースホルダーを探す
    shapes.forEach(function(shape) {
      var text = shape.getText().asString();
      if (text.indexOf('{{Image}}') !== -1) {
        // 画像URLがあれば挿入
        if (slideData.imageUrl) {
          var imageBlob = UrlFetchApp.fetch(slideData.imageUrl).getBlob();
          var position = shape.getLeft();
          var top = shape.getTop();
          var width = shape.getWidth();
          var height = shape.getHeight();
          
          // 既存のプレースホルダーを削除
          shape.remove();
          
          // 画像を挿入
          slide.insertImage(imageBlob, position, top, width, height);
        }
      }
    });
  });
}

/**
 * 会社ロゴを検索して挿入
 */
function insertCompanyLogo(presentation, companyName) {
  // Google Custom Search APIを使用してロゴ画像を検索
  // 実装省略（APIキーが必要）
  Logger.log('Company logo search for: ' + companyName);
}
```

---

## 🎨 フロントエンド実装

### 1. スライド生成時に画像生成

```typescript
// app/api/slides/route.ts に追加

async function generateSlideImage(
  visualPrompt: string,
  keyMessage: string,
  content: string
): Promise<string | null> {
  try {
    // Gemini Nano Banana Proで画像生成
    const response = await fetch('YOUR_IMAGE_GENERATION_API', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nano-banana-pro',
        prompt: `${visualPrompt}. キーメッセージ: ${keyMessage}`,
        aspect_ratio: '16:9',
      }),
    });
    
    const result = await response.json();
    return result.image_url;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}
```

---

## 📋 実装チェックリスト

### Google Apps Script
- [ ] `copyTemplate()` 関数実装
- [ ] `prepareReplacements()` 関数実装
- [ ] `replaceVariablesInPresentation()` 関数実装
- [ ] `generateAgendaSlides()` 関数実装
- [ ] `insertImages()` 関数実装
- [ ] `insertCompanyLogo()` 関数実装（Optional）

### フロントエンド
- [ ] 画像生成API統合
- [ ] アップロード画像の優先処理
- [ ] スライドデータにimageUrlフィールド追加
- [ ] エクスポート時にimageUrlを含める

### テスト
- [ ] 社外向け資料（会社名あり）でテスト
- [ ] 社内向け資料でテスト
- [ ] テンプレート変数が正しく置換されているか確認
- [ ] 個別アジェンダスライドが正しく生成されるか確認
- [ ] 画像が正しく挿入されるか確認

---

## 🚀 次のステップ

1. **Google Apps Scriptを更新**:
   - 上記コードを`apps-script/Code-Template.gs`として保存
   - デプロイを更新

2. **画像生成API統合**:
   - Gemini/Nano Banana APIキー設定
   - 画像生成エンドポイント実装

3. **エンドツーエンドテスト**:
   - デフォルトテンプレートでテスト
   - すべての変数が置換されることを確認

---

## 💡 重要ポイント

1. **テンプレートのコピー**:
   - DriveApp.makeCopy()を使用
   - 元のテンプレートは変更しない

2. **変数置換の順序**:
   - すべてのテキストボックスを走査
   - テーブル内も含めて置換
   - 大文字小文字を区別

3. **画像挿入**:
   - プレースホルダーの位置・サイズを取得
   - プレースホルダーを削除してから画像挿入
   - アスペクト比を保持

4. **エラーハンドリング**:
   - テンプレートが見つからない場合
   - 画像生成失敗時
   - 変数が見つからない場合

この実装により、プロフェッショナルなテンプレートを使用した高品質なスライド生成が可能になります！
