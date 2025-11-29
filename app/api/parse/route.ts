import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // URL parsing
      const { url, type } = await request.json();
      
      if (type === 'url') {
        return await parseWebURL(url);
      }
    } else if (contentType.includes('multipart/form-data')) {
      // File parsing
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      switch (type) {
        case 'pdf':
          return await parsePDFFile(file);
        case 'word':
          return await parseWordFile(file);
        case 'excel':
          return await parseExcelFile(file);
        case 'audio':
          return await transcribeAudio(file);
        case 'image':
          return await analyzeImage(file);
        case 'video':
          return await analyzeVideo(file);
        default:
          return NextResponse.json(
            { error: 'Unsupported file type' },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse file' },
      { status: 500 }
    );
  }
}

async function parsePDFFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  try {
    // Use pdf-parse for better Node.js compatibility
    const pdf = await import('pdf-parse');
    const data = await pdf.default(buffer);
    
    return NextResponse.json({
      content: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info,
        version: data.version,
      },
    });
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    
    // Fallback to pdfjs-dist if pdf-parse fails
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        useSystemFonts: true,
      });
      const pdfDocument = await loadingTask.promise;
      
      let fullText = '';
      const numPages = pdfDocument.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }
      
      return NextResponse.json({
        content: fullText.trim(),
        metadata: {
          pages: numPages,
          method: 'pdfjs-dist',
        },
      });
    } catch (fallbackError: any) {
      console.error('Fallback PDF parsing error:', fallbackError);
      return NextResponse.json(
        { error: `PDF parsing failed: ${fallbackError.message}. Please ensure the PDF is not password-protected and is a valid PDF file.` },
        { status: 500 }
      );
    }
  }
}

async function parseWordFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  try {
    // Dynamic import
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ buffer });
    
    return NextResponse.json({
      content: result.value,
      metadata: {
        messages: result.messages,
        length: result.value.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Word parsing failed: ${error.message}` },
      { status: 500 }
    );
  }
}

async function parseExcelFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  try {
    // Dynamic import
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    let content = '';
    const sheets: any = {};
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      sheets[sheetName] = data;
      
      content += `\n--- ${sheetName} ---\n`;
      content += XLSX.utils.sheet_to_csv(sheet);
    });
    
    return NextResponse.json({
      content: content.trim(),
      metadata: {
        sheets: workbook.SheetNames,
        sheetData: sheets,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Excel parsing failed: ${error.message}` },
      { status: 500 }
    );
  }
}

async function transcribeAudio(file: File) {
  // Use OpenAI Whisper API for transcription
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja'); // Japanese by default

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const result = await response.json();
    
    return NextResponse.json({
      content: result.text,
      metadata: {
        duration: result.duration,
        language: result.language,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Audio transcription failed: ${error.message}` },
      { status: 500 }
    );
  }
}

async function analyzeImage(file: File) {
  // Use OpenAI Vision API for image analysis
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '画像の内容を詳しく説明してください。重要な要素、データ、テキストなどすべて抽出してください。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    return NextResponse.json({
      content,
      metadata: {
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Image analysis failed: ${error.message}` },
      { status: 500 }
    );
  }
}

async function analyzeVideo(file: File) {
  // For video, we extract audio and optionally analyze key frames
  return NextResponse.json({
    content: 'Video analysis requires additional processing. Please extract audio separately or provide YouTube URL.',
    metadata: {
      size: file.size,
      type: file.type,
      note: 'Full video analysis not yet implemented',
    },
  });
}

async function parseWebURL(url: string) {
  try {
    // Check if it's a YouTube URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return NextResponse.json({
        content: `YouTube video URL: ${url}\nPlease use YouTube transcript extraction or manual summary.`,
        metadata: {
          type: 'youtube',
          url,
        },
      });
    }

    // Fetch and parse regular webpage
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic text extraction (in production, use a proper HTML parser)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return NextResponse.json({
      content: text.substring(0, 10000), // Limit to 10k chars
      metadata: {
        url,
        length: text.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `URL parsing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
