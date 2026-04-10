import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';
import { getCharacterById } from '@/data/characters';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  characterId: string;
  messages: ChatMessage[];
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

  const { characterId, messages } = body;

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
    client = getAnthropicClient();
  } catch {
    return NextResponse.json(
      { error: 'API 키가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          system: character.systemPrompt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: character.maxTokens,
          temperature: character.temperature,
        });

        response.on('text', (text) => {
          const data = JSON.stringify({ content: text });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        });

        await response.finalMessage();

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
