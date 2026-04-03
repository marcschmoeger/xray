import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import type { ChatRequestBody, Provider } from '@/types';

function getLanguageModel(provider: Provider, model: string, apiKey?: string, baseUrl?: string) {
  switch (provider) {
    case 'anthropic': {
      const anthropic = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
      });
      return anthropic(model);
    }
    case 'openai': {
      const openai = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY || '',
      });
      return openai(model);
    }
    case 'mistral': {
      const mistral = createMistral({
        apiKey: apiKey || process.env.MISTRAL_API_KEY || '',
      });
      return mistral(model);
    }
    case 'groq': {
      const groq = createGroq({
        apiKey: apiKey || process.env.GROQ_API_KEY || '',
      });
      return groq(model);
    }
    case 'ollama': {
      const ollama = createOpenAI({
        baseURL: baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        apiKey: 'ollama',
      });
      return ollama(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { provider, model, messages, systemPrompt, apiKey, baseUrl } = body;

    if (!provider || !model || !messages) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: provider, model, messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const languageModel = getLanguageModel(provider, model, apiKey, baseUrl);

    const result = streamText({
      model: languageModel,
      system: systemPrompt || undefined,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status =
      message.includes('401') || message.includes('Unauthorized')
        ? 401
        : message.includes('429') || message.includes('rate')
          ? 429
          : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
