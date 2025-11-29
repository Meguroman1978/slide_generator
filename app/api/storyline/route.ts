import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DESIGN_SYSTEM_PROMPT } from '@/lib/constants/design-rules';

export async function POST(request: NextRequest) {
  try {
    const { analysis, userInstructions, settings, presentationType } = await request.json();

    const openaiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const typeInstruction = presentationType 
      ? `\n【資料のタイプ】\n${presentationType}\n※このタイプに適したストーリーライン構成を提案してください。` 
      : '';

    const storylinePrompt = `
${DESIGN_SYSTEM_PROMPT}

【分析結果】
${JSON.stringify(analysis, null, 2)}

【ユーザー指示】
${userInstructions || 'なし（最適な構成を提案してください）'}
${typeInstruction}

上記の分析結果とユーザー指示に基づき、プレゼンテーションの**5つの異なるストーリーライン案**を提案してください。

各案は以下の要素を含めてください：
1. **ターゲットオーディエンス**: 誰に向けたプレゼンテーションか
2. **キーメッセージ**: プレゼンテーション全体で伝えたい核心メッセージ
3. **構成（導入→本論→結び）**: 具体的なスライド構成の流れ（8-15スライド想定）
4. **この案を選ぶべき理由**: なぜこのストーリーラインが効果的か

**重要な番号付けルール:**
- 構成の各項目には「1.」「2.」「3.」...「8.」のように**シンプルな連番**を使用してください
- 「1.1.」「2.2.」「最終.」などの重複や不規則な番号は使用しないでください
- 最後の項目は「8. まとめ：...」のように番号で終わらせてください

PREP法（結論→理由→具体例→結論）を意識し、聞き手の心を動かす構成を提案してください。

以下のJSON形式で5つの案を返してください：

{
  "proposals": [
    {
      "id": "案1",
      "targetAudience": "ターゲットオーディエンス",
      "keyMessage": "キーメッセージ",
      "structure": [
        "1. オープニング：...",
        "2. 問題提起：...",
        "3. ...",
        "8. まとめ：..."
      ],
      "reasoning": "この案を選ぶべき理由"
    },
    ...
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは世界最高峰のプレゼンテーションストラテジストであり、ストーリーテラーです。聴衆の心を動かすストーリーライン構成の専門家として、JSON形式で正確に回答してください。',
        },
        {
          role: 'user',
          content: storylinePrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Storyline generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate storylines' },
      { status: 500 }
    );
  }
}
