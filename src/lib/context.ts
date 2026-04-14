import { getLLMClient } from './llm';

interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
}

const RECENT_MESSAGE_COUNT = 10;
const SUMMARIZE_THRESHOLD = 20;
const REANCHOR_INTERVAL = 10;

export async function generateSummary(
  messages: SimpleMessage[],
  existingSummary?: string,
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
    .join('\n');

  const prompt = existingSummary
    ? `기존 대화 요약:\n${existingSummary}\n\n새로운 대화 내용:\n${conversationText}\n\n위 기존 요약과 새 대화를 합쳐서 하나의 요약으로 정리해주세요. 사용자의 이름, 취향, 주요 대화 맥락을 반드시 포함하세요. 3~5문장으로 간결하게 작성하세요.`
    : `다음 대화를 요약해주세요. 사용자의 이름, 취향, 주요 대화 맥락을 반드시 포함하세요. 3~5문장으로 간결하게 작성하세요.\n\n${conversationText}`;

  const llm = await getLLMClient();
  return llm.generateText(prompt, 300);
}

export interface ContextResult {
  messages: SimpleMessage[];
  newSummary?: string;
  reanchorReminder?: string;
}

function shouldReanchor(count: number): boolean {
  return count > 0 && count % REANCHOR_INTERVAL === 0;
}

export async function buildContextMessages(
  allMessages: SimpleMessage[],
  existingSummary?: string,
  reanchor?: string,
): Promise<ContextResult> {
  const reanchorReminder =
    reanchor && shouldReanchor(allMessages.length) ? reanchor : undefined;

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
        reanchorReminder,
      };
    }
    return { messages: allMessages, reanchorReminder };
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
      reanchorReminder,
    };
  }

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
      reanchorReminder,
    };
  }

  return { messages: recentMessages, reanchorReminder };
}
