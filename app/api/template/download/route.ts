import { NextRequest, NextResponse } from 'next/server';
import { downloadTemplateFromGoogleSlides, extractSlidesIdFromUrl } from '@/lib/template/download-template';

export async function POST(request: NextRequest) {
  try {
    const { slidesUrl } = await request.json();

    if (!slidesUrl) {
      return NextResponse.json(
        { error: 'Google Slides URL is required' },
        { status: 400 }
      );
    }

    // URLからSlides IDを抽出
    const slidesId = extractSlidesIdFromUrl(slidesUrl);

    if (!slidesId) {
      return NextResponse.json(
        { error: 'Invalid Google Slides URL. Could not extract Slides ID.' },
        { status: 400 }
      );
    }

    console.log(`Downloading template from Google Slides: ${slidesId}`);

    // テンプレートをダウンロード
    const result = await downloadTemplateFromGoogleSlides({
      slidesId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to download template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: result.path,
      size: result.size,
      slidesId,
      message: 'Template downloaded successfully',
    });
  } catch (error: any) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download template' },
      { status: 500 }
    );
  }
}
