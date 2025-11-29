# Google Apps Script セットアップガイド

このガイドでは、AI Presentation GeneratorでGoogle Slidesへの直接出力を可能にするGoogle Apps Scriptの設定方法を説明します。

## 📋 必要なもの

- Googleアカウント
- Google Apps Scriptへのアクセス権限
- 5分程度の時間

## 🚀 3ステップで完了！

### ステップ 1: コードをコピー

1. プロジェクトの `apps-script/Code.gs` ファイルを開きます
2. **全てのコードをコピー**します（下記参照）

<details>
<summary>📝 Code.gs の内容を表示（クリックして展開）</summary>

```javascript
/**
 * AI Presentation Generator - Google Apps Script
 * 
 * このスクリプトは、AI Presentation GeneratorからのリクエストをGoogle Slidesに変換します。
 */

function doPost(e) {
  try {
    // Parse incoming data
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON: ' + parseError.toString()
      });
    }
    
    // Validate required fields
    if (!data.metadata || !data.metadata.title) {
      return createJsonResponse({
        success: false,
        error: 'Missing required field: metadata.title'
      });
    }
    
    if (!data.slides || !Array.isArray(data.slides)) {
      return createJsonResponse({
        success: false,
        error: 'Missing or invalid slides array'
      });
    }
    
    // Create a new presentation
    var presentation = SlidesApp.create(data.metadata.title);
    var presentationId = presentation.getId();
    
    // Get the first slide (title slide) and clear it
    var slides = presentation.getSlides();
    if (slides.length > 0) {
      slides[0].remove();
    }
    
    // Process each slide
    data.slides.forEach(function(slideData, index) {
      var slide;
      
      // Determine slide layout based on template type
      switch (slideData.templateType) {
        case 'cover':
          slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE);
          createCoverSlide(slide, slideData);
          break;
        case 'section':
          slide = presentation.appendSlide(SlidesApp.PredefinedLayout.SECTION_HEADER);
          createSectionSlide(slide, slideData);
          break;
        case 'conclusion':
          slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
          createConclusionSlide(slide, slideData);
          break;
        default:
          slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
          createContentSlide(slide, slideData);
          break;
      }
      
      // Add speaker notes
      if (slideData.speakerNotes) {
        slide.getNotesPage().getSpeakerNotesShape().getText().setText(slideData.speakerNotes);
      }
    });
    
    // Return the presentation URL
    return createJsonResponse({
      success: true,
      presentationId: presentationId,
      url: presentation.getUrl()
    });
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

// Helper function to create JSON response with CORS headers
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function createCoverSlide(slide, data) {
  // Title
  var titleShape = slide.getShapes()[0];
  titleShape.getText().setText(data.title);
  
  // Subtitle (key message)
  if (slide.getShapes().length > 1) {
    var subtitleShape = slide.getShapes()[1];
    subtitleShape.getText().setText(data.keyMessage);
  }
}

function createSectionSlide(slide, data) {
  var titleShape = slide.getShapes()[0];
  titleShape.getText().setText(data.title);
}

function createContentSlide(slide, data) {
  var pageWidth = 720; // Points (10 inches)
  var pageHeight = 540; // Points (7.5 inches)
  
  // Add title at the top
  var titleBox = slide.insertTextBox(data.title, 40, 30, pageWidth - 80, 60);
  titleBox.getText()
    .getTextStyle()
    .setFontSize(24)
    .setBold(true);
  
  // Add key message (emphasized)
  var keyMessageBox = slide.insertTextBox(data.keyMessage, 40, 100, pageWidth - 80, 80);
  keyMessageBox.getText()
    .getTextStyle()
    .setFontSize(18)
    .setBold(true)
    .setForegroundColor('#1e40af'); // Primary blue color
  
  // Add layout elements
  var currentY = 200;
  
  data.layout.forEach(function(element) {
    if (element.type === 'text') {
      var textBox = slide.insertTextBox(
        element.content,
        element.position.x,
        element.position.y || currentY,
        element.position.width,
        element.position.height
      );
      
      // Apply styles
      var textStyle = textBox.getText().getTextStyle();
      if (element.style && element.style.fontSize) {
        textStyle.setFontSize(element.style.fontSize);
      }
      if (element.style && element.style.fontWeight === 'bold') {
        textStyle.setBold(true);
      }
      if (element.style && element.style.color) {
        textStyle.setForegroundColor(element.style.color);
      }
      
      currentY += element.position.height + 20;
    }
  });
}

function createConclusionSlide(slide, data) {
  var pageWidth = 720;
  
  // Title
  var titleBox = slide.insertTextBox(data.title, 40, 30, pageWidth - 80, 60);
  titleBox.getText()
    .getTextStyle()
    .setFontSize(28)
    .setBold(true);
  
  // Key message (summary)
  var keyMessageBox = slide.insertTextBox(data.keyMessage, 40, 120, pageWidth - 80, 300);
  keyMessageBox.getText()
    .getTextStyle()
    .setFontSize(20);
}

function doGet(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'AI Presentation Generator - Google Apps Script is running',
    timestamp: new Date().toISOString()
  });
}
```

</details>

### ステップ 2: Google Apps Scriptプロジェクトを作成

1. **https://script.google.com/** を開きます
2. 「新しいプロジェクト」をクリック
3. プロジェクトに分かりやすい名前を付けます（例：「AI Presentation Generator」）
4. デフォルトの `myFunction()` コードを削除
5. **ステップ1でコピーしたコードを貼り付け**
6. 「保存」ボタン（💾アイコン）をクリック

### ステップ 3: ウェブアプリとしてデプロイ

これが最も重要なステップです！

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で⚙️アイコンをクリックし、「ウェブアプリ」を選択
3. **重要な設定:**
   - **説明**: 「AI Presentation Generator」など（任意）
   - **次のユーザーとして実行**: 「自分」を選択
   - **アクセスできるユーザー**: **「全員」を選択** ⚠️ これが重要！
4. 「デプロイ」ボタンをクリック
5. 権限の承認を求められたら：
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「AI Presentation Generator（安全ではないページ）に移動」をクリック
   - 「許可」をクリック
6. **ウェブアプリのURL**をコピー（例：`https://script.google.com/macros/s/AKfycby.../exec`）

### ステップ 4: URLをアプリに設定

1. AI Presentation Generatorアプリを開く
2. 右上の「⚙️ 設定」をクリック
3. 「Google Apps Script URL」フィールドに**ステップ3でコピーしたURL**を貼り付け
4. 「保存」をクリック

## ✅ 動作確認

1. アプリでファイルをアップロードして分析
2. ストーリーライン選択 → ドラフト確認 → スライド生成
3. 「エクスポート」タブで「Google Slidesで開く」をクリック
4. 新しいタブでGoogle Slidesが開けば**成功！** 🎉

## ⚠️ よくあるエラーと解決方法

### エラー: 401 Unauthorized

**原因**: アクセス権限が正しく設定されていない

**解決方法**:
1. Google Apps Scriptプロジェクトに戻る
2. 「デプロイ」→「デプロイを管理」をクリック
3. 鉛筆アイコン（編集）をクリック
4. 「アクセスできるユーザー」が**「全員」**になっているか確認
5. 「全員」でない場合は変更して「デプロイ」をクリック
6. 新しいURLが生成される場合があるので、再度アプリに設定

### エラー: Invalid JSON

**原因**: データ送信時の問題

**解決方法**:
1. スライド生成を再実行
2. それでも解決しない場合は、アプリを再読み込み

### エラー: Script function not found

**原因**: Code.gsのコードが正しく保存されていない

**解決方法**:
1. Google Apps Scriptプロジェクトで`doPost`関数が存在するか確認
2. コードを再度コピー＆ペーストして保存
3. 再度デプロイ

## 🔒 セキュリティについて

「アクセスできるユーザー: 全員」設定は、URLを知っている人なら誰でもスクリプトを実行できることを意味します。

ただし：
- URLは推測困難な長い文字列です
- スクリプトはGoogle Slidesを作成するだけで、データの読み取りはしません
- 作成されたスライドはあなたのGoogleドライブに保存されます

より高いセキュリティが必要な場合は、OAuth認証の実装を検討してください。

## 📝 トラブルシューティング

問題が解決しない場合：

1. **ブラウザのキャッシュをクリア**
2. **シークレットモードで試す**
3. **Google Apps Scriptのログを確認**:
   - プロジェクトで「実行数」をクリック
   - エラーメッセージを確認
4. **APIキーが正しく設定されているか確認**

## 🎯 まとめ

✅ Code.gsをコピー  
✅ Google Apps Scriptプロジェクトを作成  
✅ **「アクセスできるユーザー」を「全員」に設定してデプロイ**  
✅ URLをアプリに設定  

これで、ワンクリックでGoogle Slidesを生成できます！ 🚀
