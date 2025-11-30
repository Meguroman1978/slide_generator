import { NextRequest, NextResponse } from 'next/server';
import { processImagesForSlides } from '@/lib/media/image-service';

export async function POST(request: NextRequest) {
  try {
    const { slides, metadata, settings, uploadedFiles } = await request.json();

    const googleAppsScriptUrl = 
      settings?.googleAppsScriptUrl || 
      process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!googleAppsScriptUrl) {
      return NextResponse.json(
        { 
          error: 'Google Apps Script URLが設定されていません。設定画面でURLを追加してください。',
          needsSetup: true 
        },
        { status: 400 }
      );
    }

    // Process images for slides (search logos, generate illustrations/charts)
    let companyLogoUrl = null;
    const imageMap = await processImagesForSlides(
      slides,
      uploadedFiles || [],
      settings?.companyName
    );

    // Get company logo URL if available
    if (imageMap.has('company_logo')) {
      companyLogoUrl = imageMap.get('company_logo')?.url || null;
    }

    // Ensure default template URL is always used
    const templateUrl = settings?.templateUrl || 
                        process.env.DEFAULT_TEMPLATE_URL || 
                        'https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpJbhcSTUhGX3WrI5Q/edit';

    console.log('=== TEMPLATE DEBUG ===');
    console.log('Settings templateUrl:', settings?.templateUrl);
    console.log('Env DEFAULT_TEMPLATE_URL:', process.env.DEFAULT_TEMPLATE_URL);
    console.log('Final templateUrl:', templateUrl);
    console.log('=====================');

    // Prepare data for Google Apps Script
    const payload = {
      metadata: {
        title: metadata.title || 'AI生成プレゼンテーション',
        createdAt: new Date().toISOString(),
        templateUrl, // Always include template URL
        settings: {
          ...settings,
          companyLogoUrl, // Add company logo URL
          templateUrl, // Ensure template URL is in settings too
        },
      },
      slides: slides.map((slide: any) => {
        // Find image URL for this slide
        let imageUrl = null;
        if (slide.visualPrompts && Array.isArray(slide.visualPrompts)) {
          for (const prompt of slide.visualPrompts) {
            const key = `slide_${slide.slideNumber}_${prompt}`;
            if (imageMap.has(key)) {
              imageUrl = imageMap.get(key)?.url || null;
              break;
            }
          }
        }

        return {
          slideNumber: slide.slideNumber,
          templateType: slide.templateType || 'content',
          title: slide.title,
          keyMessage: slide.keyMessage,
          layout: slide.layout || [],
          speakerNotes: slide.speakerNotes || '',
          estimatedContent: slide.estimatedContent || '',
          imageUrl, // Add image URL for this slide
        };
      }),
    };

    // Call Google Apps Script Web App
    console.log('Calling Google Apps Script URL:', googleAppsScriptUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(googleAppsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script error response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      
      // 401エラーの場合、より詳細な情報を提供
      if (response.status === 401) {
        throw new Error(
          `認証エラー (401): Google Apps Scriptのデプロイ設定を確認してください。\n` +
          `1. 「アクセスできるユーザー」が「全員」になっているか確認\n` +
          `2. 「次のユーザーとして実行」が「自分」になっているか確認\n` +
          `3. デプロイを保存後、新しいURLが生成されていないか確認\n` +
          `現在のURL: ${googleAppsScriptUrl.substring(0, 50)}...`
        );
      }
      
      throw new Error(`Google Apps Script呼び出しエラー: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'スライド生成に失敗しました');
    }

    return NextResponse.json({
      success: true,
      presentationId: result.presentationId,
      url: result.url,
      message: 'Google Slidesの作成に成功しました！',
    });
  } catch (error: any) {
    console.error('Google Slides export error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Google Slidesへのエクスポートに失敗しました',
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}
