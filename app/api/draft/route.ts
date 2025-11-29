import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DESIGN_SYSTEM_PROMPT } from '@/lib/constants/design-rules';

export async function POST(request: NextRequest) {
  try {
    const { storyline, analysis, settings } = await request.json();

    const openaiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const draftPrompt = `
${DESIGN_SYSTEM_PROMPT}

【選択されたストーリーライン】
ターゲット: ${storyline.targetAudience}
キーメッセージ: ${storyline.keyMessage}
構成: ${storyline.structure.join('\n')}

【分析データ】
${JSON.stringify(analysis, null, 2)}

上記のストーリーラインに基づき、プレゼンテーションの**ドラフト**を作成してください。

以下の情報を含むJSON形式で返してください：

{
  "title": "プレゼンテーションタイトル",
  "theme": "デザインテーマ（色の方向性など）",
  "totalSlides": 想定スライド数（数値）,
  "tableOfContents": [
    "セクション1タイトル",
    "セクション2タイトル",
    ...
  ],
  "slides": [
    {
      "slideNumber": 1,
      "title": "スライドタイトル",
      "keyMessage": "このスライドで伝えたい核心メッセージ",
      "estimatedContent": "スライド内容の概要"
    },
    ...
  ]
}

【重要】
- 1スライド1メッセージの原則を守る
- タイトルとキーメッセージは明確に区別する
- 8-15スライドの範囲で構成する
- PREP法を意識した流れにする
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは世界最高峰のプレゼンテーションデザイナーです。デザイン原則を厳格に守り、JSON形式で正確に回答してください。',
        },
        {
          role: 'user',
          content: draftPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
