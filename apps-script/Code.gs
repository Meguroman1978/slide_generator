/**
 * AI Presentation Generator - Google Apps Script
 * 
 * このスクリプトは、AI Presentation GeneratorからのリクエストをGoogle Slidesに変換します。
 * 
 * セットアップ手順:
 * 1. Google Apps Script (https://script.google.com/) で新しいプロジェクトを作成
 * 2. このコードをCode.gsに貼り付け
 * 3. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択
 * 4. 「次のユーザーとして実行」を「自分」に設定
 * 5. 「アクセスできるユーザー」を「全員」に設定
 * 6. 「デプロイ」をクリックしてURLを取得
 * 7. 取得したURLをWebアプリの設定に追加
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
  
  // Add CORS headers to allow cross-origin requests
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'CORS preflight'
  });
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
