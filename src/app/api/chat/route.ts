import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai';
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
  userName?: string;
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

  const { characterId, messages, summary: rawSummary, userName } = body;
  const summary = sanitizeSummary(rawSummary);
  const sanitizedUserName =
    typeof userName === 'string' ? userName.trim().slice(0, 20) : undefined;

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
    client = getOpenAIClient();
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

        const systemPrompt = sanitizedUserName
          ? `${character.systemPrompt}\n\n## 사용자 정보\n상대방의 이름은 "${sanitizedUserName}"이다. 캐릭터의 성격과 말투에 맞는 호칭으로 이름을 자연스럽게 불러라.`
          : character.systemPrompt;

        const openaiMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...contextMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ];

        const MAX_RETRIES = 3;
        let lastError: unknown;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          let receivedTokens = false;

          try {
            const response = await client.chat.completions.create({
              model: OPENAI_MODEL,
              messages: openaiMessages,
              max_tokens: character.maxTokens,
              temperature: character.temperature,
              stream: true,
            });

            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content;
              if (text) {
                receivedTokens = true;
                const data = JSON.stringify({ content: text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            const isRetryable =
              err instanceof Error &&
              (err.message.includes('429') ||
                err.message.includes('500') ||
                err.message.includes('503') ||
                err.message.includes('Rate limit'));

            if (!isRetryable || attempt === MAX_RETRIES - 1) break;

            if (receivedTokens) {
              controller.enqueue(
                encoder.encode('event: retry\ndata: {}\n\n'),
              );
            }

            await new Promise((r) =>
              setTimeout(r, (attempt + 1) * 2000),
            );
          }
        }

        if (lastError) throw lastError;

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
