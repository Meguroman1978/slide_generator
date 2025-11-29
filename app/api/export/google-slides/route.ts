import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { slides, metadata, settings } = await request.json();

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

    // Prepare data for Google Apps Script
    const payload = {
      metadata: {
        title: metadata.title || 'AI生成プレゼンテーション',
        createdAt: new Date().toISOString(),
        settings,
      },
      slides: slides.map((slide: any) => ({
        slideNumber: slide.slideNumber,
        templateType: slide.templateType || 'content',
        title: slide.title,
        keyMessage: slide.keyMessage,
        layout: slide.layout || [],
        speakerNotes: slide.speakerNotes || '',
      })),
    };

    // Call Google Apps Script Web App
    const response = await fetch(googleAppsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script error:', errorText);
      throw new Error(`Google Apps Script呼び出しエラー: ${response.status}`);
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
