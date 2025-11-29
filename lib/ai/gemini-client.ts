import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  systemPrompt?: string,
  options: { temperature?: number; model?: string } = {}
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: options.model || 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: options.temperature || 0.7,
    },
  });

  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\n${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text();
}

export async function tryGeminiFirst<T>(
  settings: any,
  geminiFunction: () => Promise<T>,
  openaiFunction: () => Promise<T>
): Promise<T> {
  const geminiKey = settings?.googleAiStudioApiKey || process.env.GOOGLE_AI_STUDIO_API_KEY;
  
  // Try Gemini first if available
  if (geminiKey) {
    try {
      return await geminiFunction();
    } catch (error) {
      console.log('Gemini API failed, falling back to OpenAI:', error);
    }
  }
  
  // Fall back to OpenAI
  return await openaiFunction();
}
