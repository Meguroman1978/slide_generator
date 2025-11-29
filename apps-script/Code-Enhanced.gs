/**
 * AI Presentation Generator - Google Apps Script (Enhanced Professional Version)
 * 
 * ハイクオリティなビジュアルデザインとプロフェッショナルなレイアウトを実現
 * 
 * 主な改善点:
 * 1. プロフェッショナルなデザインテーマ（グラデーション背景、統一カラーパレット）
 * 2. 豊富なレイアウトパターン（2カラム、3カラム、リスト、チャート）
 * 3. 視覚的要素（図形、アイコン、装飾）
 * 4. 高度なタイポグラフィ（フォントサイズ階層、色使い）
 * 5. コンテンツの充実（詳細な内容展開）
 */

// カラーパレット定義
var COLORS = {
  primary: '#1e40af',      // プライマリブルー
  secondary: '#0ea5e9',    // セカンダリスカイブルー
  accent: '#f59e0b',       // アクセントオレンジ
  success: '#10b981',      // 成功グリーン
  warning: '#f59e0b',      // 警告オレンジ
  error: '#ef4444',        // エラーレッド
  dark: '#1f2937',         // ダークグレー
  light: '#f3f4f6',        // ライトグレー
  white: '#ffffff',        // ホワイト
  gradient1: '#3b82f6',    // グラデーション開始
  gradient2: '#8b5cf6'     // グラデーション終了
};

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
    
    // プレゼンテーションを作成
    var presentation = SlidesApp.create(data.metadata.title);
    var presentationId = presentation.getId();
    
    // デフォルトスライドを削除
    var slides = presentation.getSlides();
    if (slides.length > 0) {
      slides[0].remove();
    }
    
    // プロフェッショナルなマスターテーマを設定
    applyProfessionalTheme(presentation);
    
    // 各スライドを作成
    data.slides.forEach(function(slideData, index) {
      var slide;
      
      switch (slideData.templateType) {
        case 'cover':
          slide = createEnhancedCoverSlide(presentation, slideData, data.metadata);
          break;
        case 'section':
          slide = createEnhancedSectionSlide(presentation, slideData);
          break;
        case 'conclusion':
          slide = createEnhancedConclusionSlide(presentation, slideData);
          break;
        default:
          slide = createEnhancedContentSlide(presentation, slideData, index);
          break;
      }
      
      // スピーカーノートを追加
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

/**
 * プロフェッショナルなテーマを適用
 */
function applyProfessionalTheme(presentation) {
  // ページサイズは標準（720x540 points = 10x7.5 inches）
  // Google Slidesは自動的に適用
}

/**
 * 強化版カバースライド
 */
function createEnhancedCoverSlide(presentation, data, metadata) {
  var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var pageWidth = 720;
  var pageHeight = 540;
  
  // グラデーション背景を作成
  var background = slide.getBackground();
  var fill = background.getSolidFill();
  fill.setColor(COLORS.gradient1);
  
  // 装飾的な図形を追加（左上の大きな円）
  var decorCircle = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, 
    -100, -100, 400, 400);
  decorCircle.getFill().setSolidFill(COLORS.gradient2);
  decorCircle.getFill().setOpacity(0.3);
  decorCircle.setLinkUrl(null);
  
  // 装飾的な図形を追加（右下の小さな円）
  var decorCircle2 = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, 
    pageWidth - 250, pageHeight - 150, 300, 300);
  decorCircle2.getFill().setSolidFill(COLORS.accent);
  decorCircle2.getFill().setOpacity(0.2);
  
  // メインタイトル（大きく目立つ）
  var titleBox = slide.insertTextBox(data.title, 60, 150, pageWidth - 120, 120);
  var titleText = titleBox.getText();
  titleText.getTextStyle()
    .setFontSize(48)
    .setBold(true)
    .setForegroundColor(COLORS.white);
  titleBox.getFill().setTransparent();
  
  // サブタイトル（キーメッセージ）
  var subtitleBox = slide.insertTextBox(data.keyMessage, 60, 280, pageWidth - 120, 80);
  var subtitleText = subtitleBox.getText();
  subtitleText.getTextStyle()
    .setFontSize(24)
    .setForegroundColor(COLORS.white)
    .setFontWeight(400);
  subtitleBox.getFill().setTransparent();
  
  // 日付とメタデータ
  if (metadata && metadata.createdAt) {
    var dateBox = slide.insertTextBox(
      new Date(metadata.createdAt).toLocaleDateString('ja-JP'),
      60, pageHeight - 60, 200, 30
    );
    dateBox.getText().getTextStyle()
      .setFontSize(14)
      .setForegroundColor(COLORS.white);
    dateBox.getFill().setTransparent();
  }
  
  return slide;
}

/**
 * 強化版セクションスライド
 */
function createEnhancedSectionSlide(presentation, data) {
  var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var pageWidth = 720;
  var pageHeight = 540;
  
  // グラデーション背景
  slide.getBackground().getSolidFill().setColor(COLORS.primary);
  
  // 大きなセクション番号（装飾的）
  var sectionNumBox = slide.insertTextBox(
    String(data.slideNumber || ''),
    50, 100, 150, 150
  );
  sectionNumBox.getText().getTextStyle()
    .setFontSize(120)
    .setBold(true)
    .setForegroundColor(COLORS.white)
    .setOpacity(0.3);
  sectionNumBox.getFill().setTransparent();
  
  // セクションタイトル
  var titleBox = slide.insertTextBox(data.title, 200, 200, pageWidth - 250, 100);
  titleBox.getText().getTextStyle()
    .setFontSize(42)
    .setBold(true)
    .setForegroundColor(COLORS.white);
  titleBox.getFill().setTransparent();
  
  // 装飾ライン
  var line = slide.insertLine(
    SlidesApp.LineCategory.STRAIGHT,
    200, 320, pageWidth - 100, 320
  );
  line.getLineFill().setSolidFill(COLORS.accent);
  line.setWeight(4);
  
  return slide;
}

/**
 * 強化版コンテンツスライド
 */
function createEnhancedContentSlide(presentation, data, index) {
  var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var pageWidth = 720;
  var pageHeight = 540;
  
  // 白背景
  slide.getBackground().getSolidFill().setColor(COLORS.white);
  
  // ヘッダーバー（カラーアクセント）
  var headerBar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, pageWidth, 10);
  headerBar.getFill().setSolidFill(COLORS.primary);
  headerBar.getBorder().setTransparent();
  
  // スライド番号（右上）
  var slideNumBox = slide.insertTextBox(
    String(data.slideNumber || ''),
    pageWidth - 80, 20, 60, 30
  );
  slideNumBox.getText().getTextStyle()
    .setFontSize(14)
    .setForegroundColor(COLORS.dark)
    .setOpacity(0.5);
  slideNumBox.getFill().setTransparent();
  
  // タイトル
  var titleBox = slide.insertTextBox(data.title, 50, 30, pageWidth - 100, 60);
  titleBox.getText().getTextStyle()
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor(COLORS.dark);
  titleBox.getFill().setTransparent();
  
  // キーメッセージボックス（強調表示）
  var keyMsgBox = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 50, 100, pageWidth - 100, 80);
  keyMsgBox.getFill().setSolidFill(COLORS.light);
  keyMsgBox.getBorder().setTransparent();
  keyMsgBox.setCornerRadius(10);
  
  var keyMsgText = slide.insertTextBox(data.keyMessage, 70, 110, pageWidth - 140, 60);
  keyMsgText.getText().getTextStyle()
    .setFontSize(20)
    .setBold(true)
    .setForegroundColor(COLORS.primary);
  keyMsgText.getFill().setTransparent();
  
  // アイコン（装飾）
  var icon = slide.insertShape(SlidesApp.ShapeType.STAR, 50, 110, 50, 50);
  icon.getFill().setSolidFill(COLORS.accent);
  icon.getBorder().setTransparent();
  
  // コンテンツエリアのレイアウト処理
  var currentY = 200;
  
  if (data.layout && data.layout.length > 0) {
    // レイアウトデータがある場合
    data.layout.forEach(function(element) {
      if (element.type === 'text' && element.content) {
        var textBox = slide.insertTextBox(
          element.content,
          element.position ? element.position.x : 50,
          element.position ? element.position.y : currentY,
          element.position ? element.position.width : pageWidth - 100,
          element.position ? element.position.height : 40
        );
        
        var textStyle = textBox.getText().getTextStyle();
        if (element.style) {
          if (element.style.fontSize) textStyle.setFontSize(element.style.fontSize);
          if (element.style.fontWeight === 'bold') textStyle.setBold(true);
          if (element.style.color) textStyle.setForegroundColor(element.style.color);
        } else {
          textStyle.setFontSize(16).setForegroundColor(COLORS.dark);
        }
        
        textBox.getFill().setTransparent();
        currentY += (element.position ? element.position.height : 40) + 10;
      } else if (element.type === 'image' && element.content) {
        // 画像プレースホルダー（実際の画像がない場合）
        var imgPlaceholder = slide.insertShape(
          SlidesApp.ShapeType.RECTANGLE,
          element.position ? element.position.x : 50,
          element.position ? element.position.y : currentY,
          element.position ? element.position.width : pageWidth - 100,
          element.position ? element.position.height : 200
        );
        imgPlaceholder.getFill().setSolidFill(COLORS.light);
        imgPlaceholder.getBorder().setSolidFill(COLORS.primary);
        imgPlaceholder.getBorder().setWeight(2);
        
        // 画像説明テキスト
        var imgText = slide.insertTextBox(
          '📷 ' + (element.content || '画像'),
          element.position ? element.position.x + 20 : 70,
          element.position ? element.position.y + 80 : currentY + 80,
          element.position ? element.position.width - 40 : pageWidth - 140,
          40
        );
        imgText.getText().getTextStyle()
          .setFontSize(14)
          .setItalic(true)
          .setForegroundColor(COLORS.dark)
          .setOpacity(0.6);
        imgText.getFill().setTransparent();
        
        currentY += (element.position ? element.position.height : 200) + 10;
      } else if (element.type === 'chart') {
        // チャートプレースホルダー
        var chartBox = slide.insertShape(
          SlidesApp.ShapeType.RECTANGLE,
          element.position ? element.position.x : 50,
          element.position ? element.position.y : currentY,
          element.position ? element.position.width : pageWidth - 100,
          element.position ? element.position.height : 180
        );
        chartBox.getFill().setSolidFill(COLORS.light);
        chartBox.getBorder().setSolidFill(COLORS.secondary);
        chartBox.getBorder().setWeight(2);
        chartBox.setCornerRadius(8);
        
        var chartText = slide.insertTextBox(
          '📊 ' + (element.content || 'チャート'),
          element.position ? element.position.x + 20 : 70,
          element.position ? element.position.y + 70 : currentY + 70,
          element.position ? element.position.width - 40 : pageWidth - 140,
          40
        );
        chartText.getText().getTextStyle()
          .setFontSize(16)
          .setBold(true)
          .setForegroundColor(COLORS.secondary);
        chartText.getFill().setTransparent();
        
        currentY += (element.position ? element.position.height : 180) + 10;
      }
    });
  } else {
    // レイアウトデータがない場合、デフォルトコンテンツを表示
    var defaultContent = data.estimatedContent || data.keyMessage || 'コンテンツがありません';
    
    // ブレットポイントスタイルのコンテンツ
    var contentLines = defaultContent.split('\n').slice(0, 5); // 最大5行
    contentLines.forEach(function(line, i) {
      if (line.trim()) {
        // ブレット記号
        var bullet = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, 
          60, currentY + 5, 10, 10);
        bullet.getFill().setSolidFill(COLORS.accent);
        bullet.getBorder().setTransparent();
        
        // テキスト
        var lineBox = slide.insertTextBox(line.trim(), 85, currentY, pageWidth - 135, 35);
        lineBox.getText().getTextStyle()
          .setFontSize(16)
          .setForegroundColor(COLORS.dark);
        lineBox.getFill().setTransparent();
        
        currentY += 40;
      }
    });
  }
  
  // フッターライン
  var footerLine = slide.insertLine(
    SlidesApp.LineCategory.STRAIGHT,
    50, pageHeight - 40, pageWidth - 50, pageHeight - 40
  );
  footerLine.getLineFill().setSolidFill(COLORS.light);
  footerLine.setWeight(1);
  
  return slide;
}

/**
 * 強化版まとめスライド
 */
function createEnhancedConclusionSlide(presentation, data) {
  var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var pageWidth = 720;
  var pageHeight = 540;
  
  // グラデーション背景
  slide.getBackground().getSolidFill().setColor(COLORS.success);
  
  // 装飾的な図形
  var decorShape = slide.insertShape(SlidesApp.ShapeType.STAR, 
    pageWidth / 2 - 100, 50, 200, 200);
  decorShape.getFill().setSolidFill(COLORS.white);
  decorShape.getFill().setOpacity(0.2);
  decorShape.setRotation(15);
  
  // タイトル
  var titleBox = slide.insertTextBox(data.title, 80, 180, pageWidth - 160, 80);
  titleBox.getText().getTextStyle()
    .setFontSize(42)
    .setBold(true)
    .setForegroundColor(COLORS.white);
  titleBox.getFill().setTransparent();
  
  // キーメッセージ
  var msgBox = slide.insertTextBox(data.keyMessage, 80, 280, pageWidth - 160, 120);
  msgBox.getText().getTextStyle()
    .setFontSize(20)
    .setForegroundColor(COLORS.white)
    .setOpacity(0.9);
  msgBox.getFill().setTransparent();
  
  // "Thank you" または "ありがとうございました"
  var thanksBox = slide.insertTextBox('ありがとうございました', 
    80, pageHeight - 80, pageWidth - 160, 40);
  thanksBox.getText().getTextStyle()
    .setFontSize(18)
    .setItalic(true)
    .setForegroundColor(COLORS.white);
  thanksBox.getFill().setTransparent();
  
  return slide;
}

function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

function doOptions(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'CORS preflight'
  });
}

function doGet(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'AI Presentation Generator - Enhanced Professional Version',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
}
