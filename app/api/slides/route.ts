import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DESIGN_SYSTEM_PROMPT, SLIDE_TEMPLATES } from '@/lib/constants/design-rules';

export async function POST(request: NextRequest) {
  try {
    const { draft, analysis, settings } = await request.json();

    const openaiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Generate detailed slides one by one or in batches
    const detailedSlides = [];

    for (const slide of draft.slides) {
      const slidePrompt = `
${DESIGN_SYSTEM_PROMPT}

【スライド情報】
番号: ${slide.slideNumber}
タイトル: ${slide.title}
キーメッセージ: ${slide.keyMessage}
概要: ${slide.estimatedContent}

【全体コンテキスト】
プレゼンテーション全体: ${draft.title}
総スライド数: ${draft.totalSlides}
分析データ: ${JSON.stringify(analysis).substring(0, 1000)}...

【設定】
フォント: ${settings.fontFamily}
アニメーション: ${settings.animationLevel}
トーン: ${settings.toneStyle}

【利用可能なテンプレート】
${JSON.stringify(SLIDE_TEMPLATES, null, 2)}

このスライドの**詳細な仕様**を以下のJSON形式で返してください：

{
  "slideNumber": ${slide.slideNumber},
  "templateType": "cover | content | section | conclusion のいずれか",
  "title": "スライドタイトル",
  "keyMessage": "核心メッセージ（強調表示）",
  "layout": [
    {
      "type": "text | image | chart | icon | shape",
      "position": {"x": 10, "y": 10, "width": 80, "height": 20},
      "content": "要素の内容",
      "style": {"fontSize": 24, "fontWeight": "bold", "color": "#333333"}
    }
  ],
  "speakerNotes": "プレゼンターが話すべき内容の原稿（200-300字）",
  "animations": [
    {
      "elementId": "要素のID",
      "type": "appear | emphasis",
      "timing": "onLoad | onClick",
      "duration": 500
    }
  ],
  "visualPrompts": [
    "画像生成AI用の詳細なプロンプト1",
    "プロンプト2"
  ]
}

【重要原則】
1. Zの法則：左上から重要情報
2. 1スライド1メッセージ
3. 配色は4色以内
4. 余白を十分に
5. フォントサイズでメリハリ
6. ${settings.toneStyle === 'casual' ? 'カジュアル・親しみやすいトーン' : 'ビジネスライク・信頼感のあるトーン'}
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたは世界最高峰のプレゼンテーションデザイナーです。デザイン原則を厳格に守り、視覚的に美しく、効果的なスライド設計を行います。JSON形式で正確に回答してください。',
          },
          {
            role: 'user',
            content: slidePrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const detailedSlide = JSON.parse(completion.choices[0].message.content || '{}');
      detailedSlides.push(detailedSlide);
    }

    return NextResponse.json({
      slides: detailedSlides,
    });
  } catch (error: any) {
    console.error('Slides generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate detailed slides' },
      { status: 500 }
    );
  }
}
