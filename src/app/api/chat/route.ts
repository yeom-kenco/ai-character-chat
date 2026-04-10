import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { getCharacterById } from '@/data/characters';
import { buildContextMessages } from '@/lib/context';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  characterId: string;
  messages: ChatMessage[];
  summary?: string;
}

const MAX_SUMMARY_LENGTH = 2000;

function sanitizeSummary(summary: unknown): string | undefined {
  if (typeof summary !== 'string' || !summary.trim()) return undefined;
  return summary.slice(0, MAX_SUMMARY_LENGTH);
}

export async function POST(request: NextRequest) {
  let body: ChatRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 },
    );
  }

  const { characterId, messages, summary: rawSummary } = body;
  const summary = sanitizeSummary(rawSummary);

  if (!characterId || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'characterId와 messages가 필요합니다.' },
      { status: 400 },
    );
  }

  const character = getCharacterById(characterId);

  if (!character) {
    return NextResponse.json(
      { error: `존재하지 않는 캐릭터입니다: ${characterId}` },
      { status: 400 },
    );
  }

  let client;
  try {
    client = getGeminiClient();
  } catch {
    return NextResponse.json(
      { error: 'API 키가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  let contextMessages: ChatMessage[];
  let newSummary: string | undefined;

  try {
    const context = await buildContextMessages(messages, summary);
    contextMessages = context.messages;
    newSummary = context.newSummary;
  } catch {
    contextMessages = messages;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (newSummary) {
          const summaryData = JSON.stringify({ summary: newSummary });
          controller.enqueue(
            encoder.encode(`event: summary\ndata: ${summaryData}\n\n`),
          );
        }

        const geminiMessages = contextMessages.map((m) => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content }],
        }));

        const response = await client.models.generateContentStream({
          model: 'gemini-2.0-flash',
          config: {
            systemInstruction: character.systemPrompt,
            temperature: character.temperature,
            maxOutputTokens: character.maxTokens,
          },
          contents: geminiMessages,
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            const data = JSON.stringify({ content: text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        const data = JSON.stringify({ error: message });
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${data}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
