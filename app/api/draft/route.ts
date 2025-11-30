import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DESIGN_SYSTEM_PROMPT } from '@/lib/constants/design-rules';

export async function POST(request: NextRequest) {
  try {
    const { storyline, analysis, settings, slideCount = 15 } = await request.json();

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
資料タイプ: ${settings.presentationType || '未指定'}
構成: ${storyline.structure.join('\n')}

【分析データ】
${JSON.stringify(analysis, null, 2)}

上記のストーリーラインに基づき、**詳細で充実したプレゼンテーションドラフト**を作成してください。

【最重要指示】
各スライドの"estimatedContent"フィールドには、**具体的で詳細な内容**を記載すること：
- 単なる箇条書きではなく、実際にスライドに表示すべき内容を記載
- データ、数値、事例、ステップなど具体的な情報を含める
- 100-200字程度の詳細な説明
- 「〜について説明」ではなく「〜の方法：1. ... 2. ... 3. ...」のような具体性

【出力JSON形式】
{
  "title": "魅力的で明確なプレゼンテーションタイトル",
  "theme": "デザインテーマ（例：モダンビジネス、信頼感のあるブルー系、イノベーティブ）",
  "totalSlides": 10-15,
  "tableOfContents": [
    "セクション1: 明確なタイトル",
    "セクション2: 明確なタイトル",
    ...
  ],
  "slides": [
    {
      "slideNumber": 1,
      "title": "インパクトのあるタイトル",
      "keyMessage": "このスライドで伝えたい核心メッセージ（1文で明確に）",
      "estimatedContent": "詳細な内容説明。具体的な数値やステップを含む。例：「導入企業数は前年比150%増加し、3000社を突破。特に製造業（40%）、小売業（30%）での採用が顕著。主な理由は1.コスト削減効果（平均30%）、2.業務効率化（作業時間50%短縮）、3.データ可視化による意思決定の高速化。」"
    },
    ...
  ]
}

【構成ガイドライン】
1. **カバースライド**: タイトル、サブタイトル、日付
2. **目次スライド**: 全体の流れを明示
3. **問題提起・背景**: 現状の課題を具体的に
4. **解決策・提案**: ステップやフレームワークを明確に
5. **データ・根拠**: 数値、グラフ、事例で説得力を
6. **ベネフィット**: 導入効果を具体的に
7. **実装ステップ**: アクションプランを明確に
8. **まとめスライド**: キーメッセージの再確認

【品質基準】
- スライド数: **必ず${slideCount}枚**（ユーザー指定）
- 各スライドのestimatedContent: 100-200字の具体的内容
- データドリブン: 分析データを最大限活用
- ストーリー性: 論理的な流れで説得力を持たせる
- 視覚化の指示: 「グラフ表示」「画像」など視覚要素を指定

**重要**: totalSlidesは必ず${slideCount}枚とし、slidesの配列も正確に${slideCount}個のスライドを含めてください。
**必ず各スライドのestimatedContentに具体的で詳細な内容を記載してください！**
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたは世界最高峰のプレゼンテーションストラテジストです。

**あなたの使命**:
- McKinsey、BCG、Goldman Sachsレベルの高品質なプレゼンテーション構成を設計
- 抽象的な内容ではなく、具体的なデータ・事例・ステップを含む詳細なドラフト
- 各スライドの内容を100-200字レベルで具体的に記載
- ストーリーテリングと論理的説得の両立

**絶対に守るべきルール**:
1. estimatedContentは必ず100-200字の具体的内容（箇条書きだけはNG）
2. データ、数値、事例を積極的に含める
3. 「〜について」ではなく「〜の具体的内容」を記載
4. スライド数は10-15枚で充実した構成
5. 各スライドのkeyMessageは核心を1文で表現

**出力**: JSON形式。estimatedContentの充実が最優先。`,
        },
        {
          role: 'user',
          content: draftPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
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
