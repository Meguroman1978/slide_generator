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
番号: ${slide.slideNumber} / ${draft.totalSlides}
タイトル: ${slide.title}
キーメッセージ: ${slide.keyMessage}
概要: ${slide.estimatedContent}

【全体コンテキスト】
プレゼンテーション全体: ${draft.title}
テーマ: ${draft.theme}
資料タイプ: ${settings.presentationType || '未指定'}
総スライド数: ${draft.totalSlides}
分析データ要約: ${JSON.stringify(analysis).substring(0, 1500)}...

【デザイン設定】
フォント: ${settings.fontFamily}
アニメーション: ${settings.animationLevel}
トーン: ${settings.toneStyle}

【最重要指示】
このスライドの**ビジュアルリッチで詳細な仕様**を作成してください。
以下の要件を**必ず満たす**こと：

1. **コンテンツの充実**:
   - layout配列に**最低5-8個の要素**を含めること
   - テキストだけでなく、画像、チャート、図形、アイコンを積極的に使用
   - 各テキスト要素は具体的で詳細な内容（単なる箇条書きではなく、説明的な文章）
   - 実際のデータや具体例を含める

2. **視覚的多様性**:
   - 必ず以下の要素タイプを組み合わせる:
     * text: タイトル、本文、説明文、キャプション
     * image: イラスト、写真、図解のプレースホルダー
     * chart: グラフ、データビジュアライゼーション
     * shape: 背景装飾、強調ボックス、セパレーター
     * icon: ポイントマーカー、カテゴリアイコン
   
3. **レイアウトパターン**:
   - 2カラムレイアウト: 左に画像/チャート、右にテキスト
   - 3カラムレイアウト: 3つの並列要素
   - Z型レイアウト: 視線誘導を意識
   - カード型レイアウト: 複数のボックスで情報を整理

4. **具体的な内容生成**:
   - 抽象的な表現を避け、具体的な数値、事例、ステップを記載
   - 「〜について」ではなく「〜の方法：1. ... 2. ... 3. ...」
   - データがある場合は必ずchartで視覚化

5. **スピーカーノート**:
   - 300-500字の詳細な原稿
   - 話す内容を具体的に記載
   - データの説明、補足情報、質問への回答例を含める

【出力JSON形式】
{
  "slideNumber": ${slide.slideNumber},
  "templateType": "cover | content | section | conclusion",
  "title": "スライドの明確なタイトル",
  "keyMessage": "このスライドの核心メッセージ（1文）",
  "layout": [
    {
      "type": "text",
      "position": {"x": 50, "y": 100, "width": 300, "height": 60},
      "content": "詳細で具体的な内容。数値やデータを含む。",
      "style": {"fontSize": 18, "fontWeight": "normal", "color": "#333333"}
    },
    {
      "type": "image",
      "position": {"x": 400, "y": 100, "width": 280, "height": 200},
      "content": "画像の詳細な説明（例：ビジネスミーティングの様子、データダッシュボード）",
      "style": {}
    },
    {
      "type": "chart",
      "position": {"x": 50, "y": 320, "width": 300, "height": 180},
      "content": "チャートの種類と表示データ（例：売上推移グラフ、2022-2024年）",
      "style": {}
    },
    {
      "type": "shape",
      "position": {"x": 50, "y": 280, "width": 620, "height": 2},
      "content": "separator-line",
      "style": {"color": "#e5e7eb"}
    },
    {
      "type": "icon",
      "position": {"x": 380, "y": 330, "width": 50, "height": 50},
      "content": "checkmark",
      "style": {"color": "#10b981"}
    }
  ],
  "speakerNotes": "詳細なプレゼンテーション原稿（300-500字）。話すべき内容を具体的に記載。データの説明、なぜ重要か、どう活用するか、予想される質問への回答などを含める。",
  "visualPrompts": [
    "ビジネスプロフェッショナルが会議している写真、明るいオフィス",
    "データグラフのイラスト、成長を示す上向き矢印"
  ]
}

【デザイン原則（厳守）】
1. Zの法則：重要情報は左上から
2. 情報密度：適度に充実（空白すぎず、詰め込みすぎず）
3. 視覚的階層：フォントサイズ・色・太さで優先度を表現
4. コントラスト：読みやすさ最優先
5. 一貫性：同じ種類の情報は同じスタイル
6. トーン: ${settings.toneStyle === 'casual' ? 'カジュアル・親しみやすい' : 'ビジネスライク・信頼感'}

**必ずlayout配列に5個以上の要素を含め、視覚的に豊かなスライドを設計してください！**
`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `あなたは世界最高峰のプレゼンテーションデザイナーです。
            
**あなたの使命**:
- Apple、Google、TED Talksレベルのビジュアルリッチなスライドを設計
- 抽象的ではなく、具体的で詳細なコンテンツを作成
- テキストだけでなく、画像・チャート・図形・アイコンを積極的に活用
- 視覚的に美しく、情報密度が高く、記憶に残るスライドを設計

**絶対に守るべきルール**:
1. layout配列には**最低5-8個の要素**を含める
2. 各スライドに必ず視覚的要素（image/chart/shape/icon）を含める
3. テキストは具体的で詳細（箇条書きだけではダメ）
4. スピーカーノートは300-500字の詳細な原稿
5. データがあれば必ずchartで視覚化
6. レイアウトは2カラム、3カラム、カードなど工夫する

**出力**: JSON形式で正確に回答。layout配列を充実させることが最優先。`,
          },
          {
            role: 'user',
            content: slidePrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
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
