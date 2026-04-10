import { getAnthropicClient } from './anthropic';

interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
}

const RECENT_MESSAGE_COUNT = 10;
const SUMMARIZE_THRESHOLD = 20;

export async function generateSummary(
  messages: SimpleMessage[],
  existingSummary?: string,
): Promise<string> {
  const client = getAnthropicClient();

  const conversationText = messages
    .map((m) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
    .join('\n');

  const prompt = existingSummary
    ? `기존 대화 요약:\n${existingSummary}\n\n새로운 대화 내용:\n${conversationText}\n\n위 기존 요약과 새 대화를 합쳐서 하나의 요약으로 정리해주세요. 사용자의 이름, 취향, 주요 대화 맥락을 반드시 포함하세요. 3~5문장으로 간결하게 작성하세요.`
    : `다음 대화를 요약해주세요. 사용자의 이름, 취향, 주요 대화 맥락을 반드시 포함하세요. 3~5문장으로 간결하게 작성하세요.\n\n${conversationText}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text ?? '';
}

export interface ContextResult {
  messages: SimpleMessage[];
  newSummary?: string;
}

export async function buildContextMessages(
  allMessages: SimpleMessage[],
  existingSummary?: string,
): Promise<ContextResult> {
  if (allMessages.length <= SUMMARIZE_THRESHOLD) {
    if (existingSummary) {
      return {
        messages: [
          {
            role: 'user',
            content: `[이전 대화 요약]\n${existingSummary}`,
          },
          { role: 'assistant', content: '네, 이전 대화를 기억하고 있습니다.' },
          ...allMessages,
        ],
      };
    }
    return { messages: allMessages };
  }

  const oldMessages = allMessages.slice(0, -RECENT_MESSAGE_COUNT);
  const recentMessages = allMessages.slice(-RECENT_MESSAGE_COUNT);

  const summaryResult = await generateSummary(oldMessages, existingSummary);
  const newSummary = summaryResult || undefined;

  if (newSummary) {
    return {
      messages: [
        {
          role: 'user',
          content: `[이전 대화 요약]\n${newSummary}`,
        },
        { role: 'assistant', content: '네, 이전 대화를 기억하고 있습니다.' },
        ...recentMessages,
      ],
      newSummary,
    };
  }

  // 요약 생성 실패 시 기존 요약 유지 + 최근 메시지만 반환
  if (existingSummary) {
    return {
      messages: [
        {
          role: 'user',
          content: `[이전 대화 요약]\n${existingSummary}`,
        },
        { role: 'assistant', content: '네, 이전 대화를 기억하고 있습니다.' },
        ...recentMessages,
      ],
    };
  }

  return { messages: recentMessages };
}
