import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { callGeminiAPI } from '@/lib/ai/gemini-client';

export async function POST(request: NextRequest) {
  try {
    const { files, settings } = await request.json();

    // Try Gemini first, then fall back to OpenAI
    const geminiKey = settings?.googleAiStudioApiKey || process.env.GOOGLE_AI_STUDIO_API_KEY;
    const openaiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please add Google AI Studio or OpenAI API key in settings.' },
        { status: 400 }
      );
    }

    // Analyze all files together to understand the context
    const analysisPrompt = `
あなたは優秀なコンテンツアナリストです。以下の資料を深く分析し、プレゼンテーション作成に必要な情報を抽出してください。

【資料一覧】
${files.map((f: any, i: number) => `${i + 1}. ${f.name} (${f.type})`).join('\n')}

【資料内容】
${files.map((f: any, i: number) => `
--- ${f.name} ---
${f.content || '(内容なし)'}
`).join('\n\n')}

以下の形式でJSON形式で分析結果を返してください：

{
  "overallSummary": "全体的なまとめ（200字程度）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "..."],
  "emotionalTone": "感情的なトーン（例：感動的、教育的、ビジネスライクなど）",
  "targetAudience": "推測されるターゲットオーディエンス",
  "mainThemes": ["主要テーマ1", "主要テーマ2", "..."],
  "dataPoints": ["重要なデータ・数字1", "データ2", "..."],
  "suggestedVisuals": ["推奨ビジュアル1", "ビジュアル2", "..."],
  "narrativeStructure": "ストーリー展開の提案"
}
`;

    let analysisResult;

    // Try Gemini first
    if (geminiKey) {
      try {
        console.log('Using Gemini API for analysis');
        const systemPrompt = 'あなたは世界最高峰のコンテンツアナリストであり、プレゼンテーション作成の専門家です。JSON形式で正確に回答してください。';
        const geminiResponse = await callGeminiAPI(geminiKey, analysisPrompt, systemPrompt, { temperature: 0.7 });
        
        // Extract JSON from response (Gemini sometimes wraps it in code blocks)
        const jsonMatch = geminiResponse.match(/```json\n?([\s\S]*?)\n?```/) || geminiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : geminiResponse;
        analysisResult = JSON.parse(jsonStr);
      } catch (geminiError) {
        console.log('Gemini failed, falling back to OpenAI:', geminiError);
        
        // Fall back to OpenAI
        if (!openaiKey) {
          throw new Error('Gemini API failed and no OpenAI fallback available');
        }
        
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'あなたは世界最高峰のコンテンツアナリストであり、プレゼンテーション作成の専門家です。JSON形式で正確に回答してください。',
            },
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });
        analysisResult = JSON.parse(completion.choices[0].message.content || '{}');
      }
    } else {
      // Use OpenAI directly
      console.log('Using OpenAI API for analysis');
      const openai = new OpenAI({ apiKey: openaiKey! });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたは世界最高峰のコンテンツアナリストであり、プレゼンテーション作成の専門家です。JSON形式で正確に回答してください。',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      analysisResult = JSON.parse(completion.choices[0].message.content || '{}');
    }

    return NextResponse.json({
      analysis: analysisResult,
      filesAnalyzed: files.length,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze files' },
      { status: 500 }
    );
  }
}
