/**
 * Google SlidesからテンプレートPPTXをダウンロード
 * 参考: https://github.com/Meguroman1978/casestudy/blob/main/download_template_from_slides.py
 */

import fs from 'fs';
import path from 'path';

interface DownloadTemplateOptions {
  slidesId: string;
  outputPath?: string;
}

interface DownloadResult {
  success: boolean;
  path?: string;
  size?: number;
  error?: string;
}

/**
 * Google SlidesからPPTXをダウンロード
 * @param options ダウンロードオプション
 * @returns ダウンロード結果
 */
export async function downloadTemplateFromGoogleSlides(
  options: DownloadTemplateOptions
): Promise<DownloadResult> {
  const { slidesId, outputPath } = options;

  if (!slidesId) {
    return {
      success: false,
      error: 'Google Slides ID is required',
    };
  }

  // Google SlidesのエクスポートURL
  const exportUrl = `https://docs.google.com/presentation/d/${slidesId}/export/pptx`;

  // 出力先パス（デフォルトはプロジェクトルート）
  const templatePath = outputPath || path.join(process.cwd(), 'Template.pptx');

  try {
    console.log(`⬇️  Downloading Template.pptx from Google Slides...`);
    console.log(`   Slides ID: ${slidesId}`);
    console.log(`   Export URL: ${exportUrl}`);

    const response = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI Presentation Generator)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Content-Typeを確認
    const contentType = response.headers.get('content-type') || '';
    console.log(`   Content-Type: ${contentType}`);

    if (!contentType.includes('presentation') && !contentType.includes('octet-stream')) {
      console.warn(
        `⚠️  Warning: Unexpected content-type: ${contentType}`
      );
      console.warn(
        `⚠️  This might not be a PPTX file. Check if the Google Slides is publicly accessible.`
      );
    }

    // ファイルに保存
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(templatePath, buffer);

    const fileSize = fs.statSync(templatePath).size;
    console.log(`✅ Template.pptx downloaded successfully (${fileSize.toLocaleString()} bytes)`);

    // サイズチェック（少なくとも100KB以上あるはず）
    if (fileSize < 100_000) {
      console.warn(
        `⚠️  Warning: File size is smaller than expected (${fileSize.toLocaleString()} bytes)`
      );
      console.warn(`⚠️  Please verify the Google Slides is publicly accessible:`);
      console.warn(`   https://docs.google.com/presentation/d/${slidesId}/edit`);
    }

    return {
      success: true,
      path: templatePath,
      size: fileSize,
    };
  } catch (error: any) {
    console.error(`❌ Error downloading Template.pptx: ${error.message}`);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error(`   1. Verify Slides ID is correct: ${slidesId}`);
    console.error(`   2. Make sure the Google Slides is publicly accessible`);
    console.error(`   3. Try accessing this URL in browser:`);
    console.error(`      ${exportUrl}`);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Google Slides URLからIDを抽出
 * @param url Google Slides URL
 * @returns Slides ID
 */
export function extractSlidesIdFromUrl(url: string): string | null {
  const patterns = [
    /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // URLがIDそのものの場合
  if (/^[a-zA-Z0-9-_]+$/.test(url)) {
    return url;
  }

  return null;
}
