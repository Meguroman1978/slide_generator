/**
 * AI Presentation Generator - Template-Based Google Apps Script (v3.0)
 * 
 * テンプレートベースのプレゼンテーション生成システム
 * 
 * 主な機能:
 * 1. Google Slidesテンプレートのコピーと変数置換
 * 2. 動的な変数挿入: {{Company Name}}, {{Company Logo}}, {{Slide Theme}}, {{YYYY/MM/DD}}, {{Agenda}}, {{Each Agenda}}, {{Key Message}}, {{Content}}, {{Image}}
 * 3. 複数アジェンダスライドの自動生成
 * 4. 画像の動的挿入（URL指定、Web検索、AI生成イラスト/チャート）
 * 5. 社外向け/社内向け資料の自動判定と対応
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // バリデーション
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
    
    // デバッグログ
    Logger.log('=== RECEIVED DATA DEBUG ===');
    Logger.log('data.metadata.templateUrl: ' + data.metadata.templateUrl);
    Logger.log('data.metadata.settings: ' + JSON.stringify(data.metadata.settings));
    Logger.log('data.metadata.settings?.templateUrl: ' + (data.metadata.settings ? data.metadata.settings.templateUrl : 'undefined'));
    
    var templateUrl = data.metadata.templateUrl || (data.metadata.settings ? data.metadata.settings.templateUrl : null);
    
    Logger.log('Final templateUrl: ' + templateUrl);
    Logger.log('===========================');
    
    var presentation;
    var presentationId;
    
    if (templateUrl) {
      // テンプレートベース生成
      Logger.log('Using template: ' + templateUrl);
      presentation = copyTemplatePresentation(templateUrl, data.metadata.title);
      presentationId = presentation.getId();
      
      // テンプレート変数を置換
      replaceTemplateVariables(presentation, data);
      
      // 各アジェンダスライドを生成
      generateAgendaSlides(presentation, data);
    } else {
      // テンプレートなし: 通常の生成（既存のロジック）
      Logger.log('WARNING: Creating presentation without template - templateUrl is null/undefined');
      presentation = SlidesApp.create(data.metadata.title);
      presentationId = presentation.getId();
      
      // デフォルトスライドを削除
      var slides = presentation.getSlides();
      if (slides.length > 0) {
        slides[0].remove();
      }
      
      // 各スライドを作成（既存のロジック）
      data.slides.forEach(function(slideData, index) {
        createStandardSlide(presentation, slideData, data.metadata, index);
      });
    }
    
    return createJsonResponse({
      success: true,
      presentationId: presentationId,
      url: presentation.getUrl(),
      message: templateUrl ? 'テンプレートベースで生成しました' : '新規生成しました'
    });
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

/**
 * テンプレートプレゼンテーションをコピー
 */
function copyTemplatePresentation(templateUrl, newTitle) {
  try {
    // URLからプレゼンテーションIDを抽出
    var templateId = extractPresentationId(templateUrl);
    
    if (!templateId) {
      throw new Error('Invalid template URL: ' + templateUrl);
    }
    
    // テンプレートを開く
    var template = SlidesApp.openById(templateId);
    
    // テンプレートをコピー
    var copiedFile = DriveApp.getFileById(templateId).makeCopy(newTitle);
    var copiedPresentation = SlidesApp.openById(copiedFile.getId());
    
    Logger.log('Template copied successfully: ' + copiedFile.getId());
    return copiedPresentation;
    
  } catch (error) {
    Logger.log('Error copying template: ' + error.toString());
    throw new Error('テンプレートのコピーに失敗しました: ' + error.message);
  }
}

/**
 * プレゼンテーションIDをURLから抽出
 */
function extractPresentationId(url) {
  var patterns = [
    /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var match = url.match(patterns[i]);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // URLがIDそのものの場合
  if (url.match(/^[a-zA-Z0-9-_]+$/)) {
    return url;
  }
  
  return null;
}

/**
 * テンプレート変数を置換
 */
function replaceTemplateVariables(presentation, data) {
  var metadata = data.metadata;
  var settings = metadata.settings || {};
  
  // 置換マップを作成
  var replacements = {
    '{{Company Name}}': getCompanyName(settings),
    '{{Slide Theme}}': metadata.title || '',
    '{{YYYY/MM/DD}}': formatDate(metadata.createdAt || new Date().toISOString()),
    '{{Agenda}}': getAgendaText(data.slides)
  };
  
  Logger.log('Replacements: ' + JSON.stringify(replacements));
  
  // 全スライドで変数を置換
  var slides = presentation.getSlides();
  slides.forEach(function(slide) {
    replaceTextInSlide(slide, replacements);
    
    // ロゴの置換（画像の場合）
    if (settings.companyLogoUrl) {
      replaceLogoInSlide(slide, settings.companyLogoUrl);
    }
  });
}

/**
 * 会社名を取得（社外向け/社内向けで分岐）
 */
function getCompanyName(settings) {
  if (settings.audienceType === 'internal' || !settings.companyName) {
    return '社内向け資料';
  }
  return settings.companyName || '';
}

/**
 * 日付をフォーマット
 */
function formatDate(isoDateString) {
  var date = new Date(isoDateString);
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '/' + month + '/' + day;
}

/**
 * アジェンダテキストを生成
 */
function getAgendaText(slides) {
  var agendaItems = [];
  slides.forEach(function(slide, index) {
    if (slide.title) {
      agendaItems.push((index + 1) + '. ' + slide.title);
    }
  });
  return agendaItems.join('\n');
}

/**
 * スライド内のテキストを置換
 */
function replaceTextInSlide(slide, replacements) {
  // テキストボックスを取得して置換
  var shapes = slide.getShapes();
  shapes.forEach(function(shape) {
    var textRange = shape.getText();
    var text = textRange.asString();
    
    var modified = false;
    for (var placeholder in replacements) {
      if (text.indexOf(placeholder) !== -1) {
        text = text.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
        modified = true;
      }
    }
    
    if (modified) {
      textRange.setText(text);
    }
  });
  
  // テーブル内のテキストも置換
  var tables = slide.getTables();
  tables.forEach(function(table) {
    for (var row = 0; row < table.getNumRows(); row++) {
      for (var col = 0; col < table.getNumColumns(); col++) {
        var cell = table.getCell(row, col);
        var textRange = cell.getText();
        var text = textRange.asString();
        
        var modified = false;
        for (var placeholder in replacements) {
          if (text.indexOf(placeholder) !== -1) {
            text = text.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
            modified = true;
          }
        }
        
        if (modified) {
          textRange.setText(text);
        }
      }
    }
  });
}

/**
 * ロゴを置換
 */
function replaceLogoInSlide(slide, logoUrl) {
  var shapes = slide.getShapes();
  shapes.forEach(function(shape) {
    var text = shape.getText().asString();
    
    if (text.indexOf('{{Company Logo}}') !== -1) {
      try {
        // 既存のテキストを削除
        shape.getText().setText('');
        
        // ロゴ画像を挿入（URLから）
        var position = {
          x: shape.getLeft(),
          y: shape.getTop(),
          width: shape.getWidth(),
          height: shape.getHeight()
        };
        
        // 画像を挿入
        slide.insertImage(logoUrl, position.x, position.y, position.width, position.height);
        
        // 元のシェイプを削除
        shape.remove();
        
      } catch (error) {
        Logger.log('Error replacing logo: ' + error.toString());
        // エラーの場合はテキストとして残す
        shape.getText().setText('[Logo]');
      }
    }
  });
}

/**
 * 各アジェンダスライドを生成
 */
function generateAgendaSlides(presentation, data) {
  var slides = presentation.getSlides();
  var agendaTemplateSlide = null;
  var agendaTemplateIndex = -1;
  
  // アジェンダテンプレートスライドを検索
  for (var i = 0; i < slides.length; i++) {
    var shapes = slides[i].getShapes();
    for (var j = 0; j < shapes.length; j++) {
      var text = shapes[j].getText().asString();
      if (text.indexOf('{{Each Agenda}}') !== -1) {
        agendaTemplateSlide = slides[i];
        agendaTemplateIndex = i;
        break;
      }
    }
    if (agendaTemplateSlide) break;
  }
  
  if (!agendaTemplateSlide) {
    Logger.log('No agenda template slide found');
    return;
  }
  
  Logger.log('Found agenda template at index: ' + agendaTemplateIndex);
  
  // 各アジェンダアイテムに対してスライドを生成
  var insertIndex = agendaTemplateIndex;
  data.slides.forEach(function(slideData, index) {
    if (slideData.title) {
      // テンプレートをコピー
      var newSlide = agendaTemplateSlide.duplicate();
      
      // 新しいスライドを適切な位置に移動
      insertIndex++;
      presentation.setSlideAt(newSlide, insertIndex);
      
      // 変数を置換
      var replacements = {
        '{{Each Agenda}}': slideData.title,
        '{{Key Message}}': slideData.keyMessage || '',
        '{{Content}}': slideData.estimatedContent || generateContentFromLayout(slideData.layout)
      };
      
      replaceTextInSlide(newSlide, replacements);
      
      // 画像を挿入（{{Image}}プレースホルダーがある場合）
      if (slideData.imageUrl) {
        replaceImageInSlide(newSlide, slideData.imageUrl);
      }
    }
  });
  
  // 元のテンプレートスライドを削除
  agendaTemplateSlide.remove();
}

/**
 * レイアウトからコンテンツテキストを生成
 */
function generateContentFromLayout(layout) {
  if (!layout || !Array.isArray(layout)) {
    return '';
  }
  
  var contentParts = [];
  layout.forEach(function(element) {
    if (element.type === 'text' && element.content) {
      contentParts.push(element.content);
    }
  });
  
  return contentParts.join('\n\n');
}

/**
 * スライド内の画像を置換
 */
function replaceImageInSlide(slide, imageUrl) {
  var shapes = slide.getShapes();
  shapes.forEach(function(shape) {
    var text = shape.getText().asString();
    
    if (text.indexOf('{{Image}}') !== -1) {
      try {
        var position = {
          x: shape.getLeft(),
          y: shape.getTop(),
          width: shape.getWidth(),
          height: shape.getHeight()
        };
        
        // 画像を挿入
        slide.insertImage(imageUrl, position.x, position.y, position.width, position.height);
        
        // 元のプレースホルダーを削除
        shape.remove();
        
      } catch (error) {
        Logger.log('Error replacing image: ' + error.toString());
        shape.getText().setText('[Image]');
      }
    }
  });
}

/**
 * 標準スライドを作成（テンプレートなしの場合）
 */
function createStandardSlide(presentation, slideData, metadata, index) {
  var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var pageWidth = 720;
  var pageHeight = 540;
  
  // 白背景
  slide.getBackground().getSolidFill().setColor('#ffffff');
  
  // タイトル
  var titleBox = slide.insertTextBox(slideData.title, 50, 30, pageWidth - 100, 60);
  titleBox.getText().getTextStyle()
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor('#1f2937');
  
  // キーメッセージ
  var keyMsgBox = slide.insertTextBox(slideData.keyMessage, 50, 100, pageWidth - 100, 80);
  keyMsgBox.getText().getTextStyle()
    .setFontSize(20)
    .setBold(true)
    .setForegroundColor('#1e40af');
  
  // コンテンツ
  var content = slideData.estimatedContent || '';
  if (content) {
    var contentBox = slide.insertTextBox(content, 50, 200, pageWidth - 100, 280);
    contentBox.getText().getTextStyle()
      .setFontSize(16)
      .setForegroundColor('#1f2937');
  }
  
  // スピーカーノート
  if (slideData.speakerNotes) {
    slide.getNotesPage().getSpeakerNotesShape().getText().setText(slideData.speakerNotes);
  }
  
  return slide;
}

/**
 * JSONレスポンスを作成
 */
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

/**
 * CORS プリフライトリクエスト
 */
function doOptions(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'CORS preflight'
  });
}

/**
 * ヘルスチェック
 */
function doGet(e) {
  return createJsonResponse({
    status: 'ok',
    message: 'AI Presentation Generator - Template-Based Enhanced Version',
    version: '3.0',
    features: [
      'Template copying and variable replacement',
      'Dynamic {{Company Name}}, {{Company Logo}}, {{Slide Theme}}, {{YYYY/MM/DD}}, {{Agenda}} support',
      'Multiple agenda slide generation with {{Each Agenda}}, {{Key Message}}, {{Content}}, {{Image}}',
      'Image insertion support (URL, web search, AI-generated)',
      'External/internal material type support'
    ],
    timestamp: new Date().toISOString()
  });
}
