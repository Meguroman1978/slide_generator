import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { slides, metadata, settings } = await request.json();

    // Generate a structured JSON format that can be used to create PowerPoint
    // This will be downloaded as JSON and can be converted to PPTX using tools
    const pptxData = {
      metadata: {
        title: metadata.title || 'AI生成プレゼンテーション',
        author: 'AI Presentation Generator',
        createdAt: new Date().toISOString(),
        settings,
      },
      slideSize: {
        width: 10, // inches
        height: 7.5, // inches
        aspectRatio: '4:3',
      },
      slides: slides.map((slide: any, index: number) => {
        const slideData: any = {
          slideNumber: slide.slideNumber || index + 1,
          templateType: slide.templateType || 'content',
          title: slide.title || '',
          keyMessage: slide.keyMessage || '',
          layout: slide.layout || [],
          speakerNotes: slide.speakerNotes || '',
          backgroundColor: '#FFFFFF',
        };

        // Add layout elements
        if (slide.layout && slide.layout.length > 0) {
          slideData.elements = slide.layout.map((element: any) => ({
            type: element.type,
            content: element.content,
            position: element.position,
            style: element.style || {},
          }));
        }

        // Add visual prompts for reference
        if (slide.visualPrompts && slide.visualPrompts.length > 0) {
          slideData.visualPrompts = slide.visualPrompts;
        }

        return slideData;
      }),
      designPrinciples: {
        fontFamily: settings.fontFamily || 'メイリオ',
        animationLevel: settings.animationLevel || 'none',
        toneStyle: settings.toneStyle || 'standard',
        colorScheme: {
          background: '#FFFFFF',
          text: '#333333',
          primary: '#1e40af',
          accent: '#8b5cf6',
        },
      },
    };

    // Return the structured data as JSON
    return NextResponse.json({
      success: true,
      data: pptxData,
      message: 'PowerPointデータを生成しました',
    });
  } catch (error: any) {
    console.error('PowerPoint export error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'PowerPointへのエクスポートに失敗しました',
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}
