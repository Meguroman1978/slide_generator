import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, model, aspectRatio, imageType } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: '画像生成のクエリが指定されていません' },
        { status: 400 }
      );
    }

    // Determine the appropriate model based on image type
    let selectedModel = model;
    if (!selectedModel) {
      if (imageType === 'illustration') {
        selectedModel = 'nano-banana-pro';
      } else if (imageType === 'chart' || imageType === 'diagram') {
        // Use ideogram or other chart-friendly models
        selectedModel = 'ideogram/V_3';
      } else {
        selectedModel = 'nano-banana-pro'; // default
      }
    }

    console.log(`Generating ${imageType} image with model ${selectedModel}: ${query}`);

    // Prepare detailed prompt based on image type
    let enhancedQuery = query;
    if (imageType === 'illustration') {
      enhancedQuery = `Professional business illustration: ${query}. High quality, corporate style, suitable for presentation slides, clean design, modern aesthetic.`;
    } else if (imageType === 'chart') {
      enhancedQuery = `Professional business chart or diagram: ${query}. Clear data visualization, clean layout, suitable for presentation slides, professional color scheme, easy to understand.`;
    }

    // Note: This requires GenSpark image_generation tool integration
    // Since we can't directly call the image_generation tool from here,
    // we'll return a structured response that indicates what should be generated
    
    // In a production environment with GenSpark integration:
    // const imageResult = await image_generation({
    //   query: enhancedQuery,
    //   model: selectedModel,
    //   aspect_ratio: aspectRatio || '16:9',
    //   image_urls: [],
    //   task_summary: `Generate ${imageType} for AI presentation: ${query}`
    // });

    // For now, return a placeholder that indicates the system is ready for image generation
    return NextResponse.json({
      success: true,
      imageUrl: null, // Will be populated by actual generation tool
      message: `Image generation initiated for: ${query}`,
      model: selectedModel,
      query: enhancedQuery,
      imageType,
      aspectRatio: aspectRatio || '16:9',
      // Indicate that GenSpark image_generation tool should be called
      requiresGenSparkTool: true,
      toolName: 'image_generation',
      toolParams: {
        query: enhancedQuery,
        model: selectedModel,
        aspect_ratio: aspectRatio || '16:9',
        image_urls: [],
        task_summary: `Generate ${imageType} for AI presentation: ${query}`
      }
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || '画像生成に失敗しました' },
      { status: 500 }
    );
  }
}
