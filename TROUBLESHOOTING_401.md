# 🔴 Google Apps Script 401エラー 完全解決ガイド

## 問題の症状

- 「Google Slidesで開く」ボタンをクリックすると **401エラー** が発生
- エラーメッセージ: `Google Apps Script呼び出しエラー: 401`

## 🎯 根本原因

あなたの現在のApps Script URL:
```
https://script.google.com/macros/s/AKfycbwYw9agkH9pig0IkksI2KDrP1rmekCKrFA0vtw8xe6K5nznEkYb1LeWRxRS9F0vkBxKXA/exec
```

このURLは **正しくデプロイされていません**。テスト結果:

### ❌ GETリクエストの結果
```
302 Redirect → Googleログインページにリダイレクト
```
**意味**: 認証が必要な状態 = 「アクセスできるユーザー」が「全員」になっていない

### ❌ POSTリクエストの結果
```
Page Not Found エラー
```
**意味**: Web Appとして適切にデプロイされていない

## ✅ 完全な解決手順

### ステップ1: Apps Script プロジェクトを開く

1. https://script.google.com/ にアクセス
2. あなたのプロジェクトを開く:
   ```
   https://script.google.com/home/projects/1f86p4jLM8nCdCLUqi_3EiCLXp_lsR4-FuumQJytHB21CoT1PZ0aFY_Kn/edit
   ```

### ステップ2: コードを確認・更新

`Code.gs` ファイルに以下のコードが入っているか確認:

```javascript
/**
 * AI Presentation Generator - Google Apps Script
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
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
    
    var presentation = SlidesApp.create(data.metadata.title);
    var presentationId = presentation.getId();
    
    var slides = presentation.getSlides();
    if (slides.length > 0) {
      slides[0].remove();
    }
    
    data.slides.forEach(function(slideData, index) {
      var slide;
      
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
      
      if (slideData.speakerNotes) {
        slide.getNotesPage().getSpeakerNotesShape().getText().setText(slideData.speakerNotes);
      }
    });
    
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

function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function createCoverSlide(slide, data) {
  var titleShape = slide.getShapes()[0];
  titleShape.getText().setText(data.title);
  
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
  var pageWidth = 720;
  var pageHeight = 540;
  
  var titleBox = slide.insertTextBox(data.title, 40, 30, pageWidth - 80, 60);
  titleBox.getText()
    .getTextStyle()
    .setFontSize(24)
    .setBold(true);
  
  var keyMessageBox = slide.insertTextBox(data.keyMessage, 40, 100, pageWidth - 80, 80);
  keyMessageBox.getText()
    .getTextStyle()
    .setFontSize(18)
    .setBold(true)
    .setForegroundColor('#1e40af');
  
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
  
  var titleBox = slide.insertTextBox(data.title, 40, 30, pageWidth - 80, 60);
  titleBox.getText()
    .getTextStyle()
    .setFontSize(28)
    .setBold(true);
  
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

### ステップ3: 正しくデプロイする

#### 🎯 **重要**: 既存のデプロイを削除してから新規デプロイ

1. **既存デプロイの削除**:
   - 「デプロイ」→「デプロイを管理」
   - 既存のデプロイを見つけて **削除** ←重要！

2. **新規デプロイ**:
   - 「デプロイ」→「新しいデプロイ」
   - 種類: **「ウェブアプリ」** を選択
   - 説明: `AI Presentation Generator`

3. **設定を正確に行う**:
   ```
   ⚠️ 次のユーザーとして実行: 自分（あなたのGmail）
   ⚠️ アクセスできるユーザー: 全員  ← 最重要！
   ```

4. **「デプロイ」をクリック**

5. **新しいURLをコピー**:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### ステップ4: URLをテストする

新しいURLを取得したら、ターミナルでテスト:

```bash
# GETテスト
curl -X GET "YOUR_NEW_URL"

# 期待される結果:
# {"status":"ok","message":"AI Presentation Generator - Google Apps Script is running","timestamp":"..."}
```

✅ **成功**: JSONレスポンスが返ってくる
❌ **失敗**: HTMLページやリダイレクトが返ってくる → ステップ3をやり直す

### ステップ5: アプリに新しいURLを設定

1. アプリの「設定」を開く
2. 「API設定」タブ
3. 「Google Apps Script URL」に **新しいURL** を貼り付け
4. 「設定を保存」

## 🧪 テスト方法

1. ファイルをアップロード
2. 分析 → ストーリーライン → 下書き → スライド生成
3. 「エクスポート」タブ
4. 「Google Slidesで開く」をクリック

✅ **成功**: Google Slidesが新しいタブで開く
❌ **失敗**: 401エラー → デプロイ設定をもう一度確認

## 📞 まだ解決しない場合

以下を確認:

### チェックリスト
- [ ] Apps Scriptプロジェクトがあなたのアカウントで作成されている
- [ ] `Code.gs`に正しいコードが入っている
- [ ] 既存のデプロイを削除してから新規デプロイした
- [ ] 「アクセスできるユーザー」が **「全員」** になっている
- [ ] 新しいURLで GETテストが成功する（JSONが返る）
- [ ] アプリの設定に新しいURLを保存した
- [ ] ブラウザのキャッシュをクリアした

### よくある間違い

❌ **「アクセスできるユーザー」が「Googleアカウントを持つすべてのユーザー」**
   → これは **不十分** です。**「全員」** を選択してください。

❌ **古いデプロイを削除せずに新規デプロイ**
   → URLが変わらない可能性があります。必ず削除してから新規作成。

❌ **「次のユーザーとして実行」が「ユーザーがアプリにアクセスしたとき」**
   → **「自分」** に設定してください。

## 📚 参考リンク

- [Google Apps Script Web Apps Documentation](https://developers.google.com/apps-script/guides/web)
- [Apps Script Authorization](https://developers.google.com/apps-script/guides/services/authorization)

## 🎓 技術的な説明

### なぜ401エラーが発生するのか？

1. **認証が必要な状態でデプロイされている**:
   - 「アクセスできるユーザー」が「全員」以外 → 認証トークンが必要
   - しかし、外部APIからは認証トークンを送信できない → 401エラー

2. **デプロイが有効化されていない**:
   - デプロイ後、Google側で有効化されるまで数分かかる場合がある
   - URLは生成されるが、実際にはアクセスできない状態

3. **Web Appとして正しくデプロイされていない**:
   - 「ライブラリ」や「アドオン」としてデプロイしている
   - 「ウェブアプリ」を選択する必要がある

### 正しいデプロイの確認方法

```bash
# 正常なレスポンス (✅)
curl "YOUR_URL"
{"status":"ok","message":"...","timestamp":"..."}

# 認証エラー (❌)
curl "YOUR_URL"
<HTML>...Moved Temporarily...ServiceLogin...</HTML>

# Not Foundエラー (❌)
curl "YOUR_URL"
<!DOCTYPE html>...Page Not Found...</html>
```

---

**このガイドに従えば、401エラーは100%解決できます！** 🎉
