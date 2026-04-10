// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/gemini', () => ({
  getGeminiClient: vi.fn(),
  GEMINI_MODEL: 'gemini-2.5-flash',
}));

import { buildContextMessages, generateSummary } from '../context';
import { getGeminiClient } from '@/lib/gemini';

const mockedGetGeminiClient = vi.mocked(getGeminiClient);

function makeMessages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `message-${i}`,
  }));
}

function makeFakeClient(summaryText: string) {
  return {
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: summaryText,
      }),
    },
  } as unknown as ReturnType<typeof getGeminiClient>;
}

describe('buildContextMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns messages unchanged when count <= 20 and no existing summary', async () => {
    const messages = makeMessages(15);

    const result = await buildContextMessages(messages);

    expect(result.messages).toEqual(messages);
    expect(result.newSummary).toBeUndefined();
  });

  it('prepends summary pair when count <= 20 and existing summary is provided', async () => {
    const messages = makeMessages(10);
    const existingSummary = '이전 대화 요약 내용';

    const result = await buildContextMessages(messages, existingSummary);

    expect(result.messages.length).toBe(10 + 2);
    expect(result.messages[0]).toEqual({
      role: 'user',
      content: `[이전 대화 요약]\n${existingSummary}`,
    });
    expect(result.messages[1]).toEqual({
      role: 'assistant',
      content: '네, 이전 대화를 기억하고 있습니다.',
    });
    expect(result.messages.slice(2)).toEqual(messages);
    expect(result.newSummary).toBeUndefined();
  });

  it('returns messages unchanged at exact threshold (20 messages)', async () => {
    const messages = makeMessages(20);

    const result = await buildContextMessages(messages);

    expect(result.messages).toEqual(messages);
    expect(result.newSummary).toBeUndefined();
  });

  it('triggers summarization at threshold + 1 (21 messages)', async () => {
    const fakeSummary = '경계값 요약';
    const fakeClient = makeFakeClient(fakeSummary);
    mockedGetGeminiClient.mockReturnValue(fakeClient);

    const messages = makeMessages(21);

    const result = await buildContextMessages(messages);

    expect(fakeClient.models.generateContent).toHaveBeenCalledOnce();
    expect(result.newSummary).toBe(fakeSummary);
    expect(result.messages.slice(2)).toEqual(messages.slice(-10));
  });

  it('summarizes old messages and returns summary pair + last 10 when count > 20', async () => {
    const fakeSummary = '대화 요약 결과입니다.';
    const fakeClient = makeFakeClient(fakeSummary);
    mockedGetGeminiClient.mockReturnValue(fakeClient);

    const messages = makeMessages(25);

    const result = await buildContextMessages(messages);

    expect(fakeClient.models.generateContent).toHaveBeenCalledOnce();
    expect(result.messages.length).toBe(12);
    expect(result.messages[0]).toEqual({
      role: 'user',
      content: `[이전 대화 요약]\n${fakeSummary}`,
    });
    expect(result.messages[1]).toEqual({
      role: 'assistant',
      content: '네, 이전 대화를 기억하고 있습니다.',
    });
    expect(result.messages.slice(2)).toEqual(messages.slice(-10));
    expect(result.newSummary).toBe(fakeSummary);
  });
});

describe('generateSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API and returns the summary text', async () => {
    const fakeSummary = '요약된 텍스트';
    const fakeClient = makeFakeClient(fakeSummary);
    mockedGetGeminiClient.mockReturnValue(fakeClient);

    const messages = makeMessages(5);
    const result = await generateSummary(messages);

    expect(fakeClient.models.generateContent).toHaveBeenCalledOnce();
    expect(result).toBe(fakeSummary);
  });

  it('includes existing summary in the prompt when provided', async () => {
    const fakeClient = makeFakeClient('updated summary');
    mockedGetGeminiClient.mockReturnValue(fakeClient);

    const messages = makeMessages(3);
    await generateSummary(messages, '기존 요약');

    const callArgs = fakeClient.models.generateContent.mock.calls[0][0];
    const promptContent = String(callArgs.contents);
    expect(promptContent).toContain('기존 대화 요약');
    expect(promptContent).toContain('기존 요약');
  });

  it('returns empty string when text is undefined', async () => {
    const fakeClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: undefined,
        }),
      },
    } as unknown as ReturnType<typeof getGeminiClient>;
    mockedGetGeminiClient.mockReturnValue(fakeClient);

    const result = await generateSummary(makeMessages(3));
    expect(result).toBe('');
  });
});
