interface StreamChatOptions {
  characterId: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export async function streamChat({
  characterId,
  messages,
  onToken,
  onDone,
  onError,
  signal,
}: StreamChatOptions): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, messages }),
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('event: error')) {
        continue;
      }

      if (!line.startsWith('data: ')) continue;

      const payload = line.slice(6);

      if (payload === '[DONE]') {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(payload);

        if (parsed.error) {
          onError(parsed.error);
          return;
        }

        if (parsed.content) {
          onToken(parsed.content);
        }
      } catch {
        // 파싱 불가능한 라인 무시
      }
    }
  }

  onDone();
}
