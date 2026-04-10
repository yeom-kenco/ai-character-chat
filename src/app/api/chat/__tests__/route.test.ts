// @vitest-environment node
import { afterEach, describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL: 'gpt-4o-mini',
}));

vi.mock('@/lib/context', () => ({
  buildContextMessages: vi.fn(async (messages: unknown[]) => ({
    messages,
  })),
}));

import { POST } from '../route';
import { getOpenAIClient } from '@/lib/openai';

const mockedGetOpenAIClient = vi.mocked(getOpenAIClient);

function createRequest(body: unknown) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createInvalidJsonRequest() {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json',
  });
}

describe('POST /api/chat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 for invalid JSON body', async () => {
    const response = await POST(createInvalidJsonRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 요청 형식입니다.');
  });

  it('returns 400 when characterId is missing', async () => {
    const response = await POST(
      createRequest({ messages: [{ role: 'user', content: 'hello' }] }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('characterId와 messages가 필요합니다.');
  });

  it('returns 400 when messages is empty array', async () => {
    const response = await POST(
      createRequest({ characterId: 'luna', messages: [] }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('characterId와 messages가 필요합니다.');
  });

  it('returns 400 when messages is not an array', async () => {
    const response = await POST(
      createRequest({ characterId: 'luna', messages: 'not-an-array' }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('characterId와 messages가 필요합니다.');
  });

  it('returns 400 for non-existent characterId', async () => {
    const response = await POST(
      createRequest({
        characterId: 'nonexistent',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('존재하지 않는 캐릭터입니다: nonexistent');
  });

  it('returns 500 when OPENAI_API_KEY is not set', async () => {
    mockedGetOpenAIClient.mockImplementation(() => {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    });

    const response = await POST(
      createRequest({
        characterId: 'luna',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API 키가 설정되지 않았습니다.');
  });
});
