interface StreamChatOptions {
  characterId: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  summary?: string;
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  onSummary?: (summary: string) => void;
  signal?: AbortSignal;
}

export async function streamChat({
  characterId,
  messages,
  summary,
  onToken,
  onDone,
  onError,
  onSummary,
  signal,
}: StreamChatOptions): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, messages, summary }),
    signal,
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      onError(data.error ?? `HTTP ${response.status}`);
    } catch {
      onError(`HTTP ${response.status}`);
    }
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('스트림을 읽을 수 없습니다.');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');

      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
        continue;
      }

      if (!line.startsWith('data: ')) continue;

      const payload = line.slice(6).trim();

      if (payload === '[DONE]') {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(payload);

        if (currentEvent === 'error') {
          onError(parsed.error ?? 'Unknown error');
          currentEvent = '';
          return;
        }

        if (currentEvent === 'summary') {
          if (typeof parsed.summary === 'string') {
            onSummary?.(parsed.summary);
          }
          currentEvent = '';
          continue;
        }

        if (parsed.content) {
          onToken(parsed.content);
        }
      } catch {
        // 파싱 불가능한 라인 무시
      }

      currentEvent = '';
    }
  }

  onDone();
}
