// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/openai', () => ({
  getOpenAIClient: vi.fn(),
  OPENAI_MODEL: 'gpt-4o-mini',
}));

import { buildContextMessages, generateSummary } from '../context';
import { getOpenAIClient } from '@/lib/openai';

const mockedGetOpenAIClient = vi.mocked(getOpenAIClient);

function makeMessages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `message-${i}`,
  }));
}

function makeFakeClient(summaryText: string) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: summaryText } }],
        }),
      },
    },
  } as unknown as ReturnType<typeof getOpenAIClient>;
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
    const result = await buildContextMessages(messages, '이전 대화 요약 내용');
    expect(result.messages.length).toBe(12);
    expect(result.messages[0].content).toContain('이전 대화 요약 내용');
    expect(result.newSummary).toBeUndefined();
  });

  it('returns messages unchanged at exact threshold (20 messages)', async () => {
    const messages = makeMessages(20);
    const result = await buildContextMessages(messages);
    expect(result.messages).toEqual(messages);
    expect(result.newSummary).toBeUndefined();
  });

  it('triggers summarization at threshold + 1 (21 messages)', async () => {
    const fakeClient = makeFakeClient('경계값 요약');
    mockedGetOpenAIClient.mockReturnValue(fakeClient);

    const messages = makeMessages(21);
    const result = await buildContextMessages(messages);

    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result.newSummary).toBe('경계값 요약');
    expect(result.messages.slice(2)).toEqual(messages.slice(-10));
  });

  it('summarizes old messages and returns summary pair + last 10 when count > 20', async () => {
    const fakeClient = makeFakeClient('대화 요약 결과입니다.');
    mockedGetOpenAIClient.mockReturnValue(fakeClient);

    const messages = makeMessages(25);
    const result = await buildContextMessages(messages);

    expect(result.messages.length).toBe(12);
    expect(result.messages[0].content).toContain('대화 요약 결과입니다.');
    expect(result.messages.slice(2)).toEqual(messages.slice(-10));
    expect(result.newSummary).toBe('대화 요약 결과입니다.');
  });
});

describe('generateSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the API and returns the summary text', async () => {
    const fakeClient = makeFakeClient('요약된 텍스트');
    mockedGetOpenAIClient.mockReturnValue(fakeClient);

    const result = await generateSummary(makeMessages(5));
    expect(fakeClient.chat.completions.create).toHaveBeenCalledOnce();
    expect(result).toBe('요약된 텍스트');
  });

  it('includes existing summary in the prompt when provided', async () => {
    const fakeClient = makeFakeClient('updated summary');
    mockedGetOpenAIClient.mockReturnValue(fakeClient);

    await generateSummary(makeMessages(3), '기존 요약');

    const callArgs = fakeClient.chat.completions.create.mock.calls[0][0];
    const prompt = callArgs.messages[0].content;
    expect(prompt).toContain('기존 대화 요약');
    expect(prompt).toContain('기존 요약');
  });

  it('returns empty string when content is null', async () => {
    const fakeClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: null } }],
          }),
        },
      },
    } as unknown as ReturnType<typeof getOpenAIClient>;
    mockedGetOpenAIClient.mockReturnValue(fakeClient);

    const result = await generateSummary(makeMessages(3));
    expect(result).toBe('');
  });
});
