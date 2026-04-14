/**
 * LLM 어댑터 — 환경변수 LLM_PROVIDER로 OpenAI/Gemini 전환
 *
 * .env.local 설정:
 *   OpenAI 사용 시: LLM_PROVIDER=openai  + OPENAI_API_KEY=...
 *   Gemini 사용 시: LLM_PROVIDER=gemini  + GEMINI_API_KEY=...
 *
 * LLM_PROVIDER 미설정 시 기본값: openai
 */

export interface LLMStreamCallbacks {
  onToken: (token: string) => void;
}

export interface LLMClient {
  chatStream(options: {
    systemPrompt: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    maxTokens: number;
    temperature: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    callbacks: LLMStreamCallbacks;
  }): Promise<void>;

  generateText(prompt: string, maxTokens?: number): Promise<string>;
}

function getProvider(): 'openai' | 'gemini' {
  const provider = process.env.LLM_PROVIDER ?? 'openai';
  if (provider !== 'openai' && provider !== 'gemini') {
    throw new Error(`지원하지 않는 LLM_PROVIDER: ${provider}`);
  }
  return provider;
}

async function createOpenAIClient(): Promise<LLMClient> {
  const { getOpenAIClient, OPENAI_MODEL } = await import('./openai');
  const client = getOpenAIClient();

  return {
    async chatStream({
      systemPrompt,
      messages,
      maxTokens,
      temperature,
      topP,
      presencePenalty,
      frequencyPenalty,
      callbacks,
    }) {
      const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: maxTokens,
        temperature,
        ...(topP !== undefined && { top_p: topP }),
        ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
        ...(frequencyPenalty !== undefined && { frequency_penalty: frequencyPenalty }),
        stream: true,
      });

      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) callbacks.onToken(text);
      }
    },

    async generateText(prompt, maxTokens = 300) {
      const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      });
      return response.choices[0]?.message?.content ?? '';
    },
  };
}

async function createGeminiClient(): Promise<LLMClient> {
  // 두 달 뒤 Gemini로 전환 시 @google/genai 설치 후 이 부분 구현
  // npm install @google/genai
  // .env.local에 LLM_PROVIDER=gemini, GEMINI_API_KEY=... 설정
  //
  // 샘플링 파라미터 매핑 (@google/genai의 GenerateContentConfig):
  //   - topP → config.topP
  //   - presencePenalty → config.presencePenalty
  //   - frequencyPenalty → config.frequencyPenalty
  // 세 값 모두 Gemini가 지원하므로 그대로 전달할 것.

  throw new Error(
    'Gemini 클라이언트는 아직 활성화되지 않았습니다. @google/genai를 설치하고 이 함수를 구현하세요.',
  );

  // 구현 예시:
  // const { GoogleGenAI } = await import('@google/genai');
  // const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  // return {
  //   async chatStream({ systemPrompt, messages, maxTokens, temperature, topP, presencePenalty, frequencyPenalty, callbacks }) {
  //     const response = await client.models.generateContentStream({
  //       model: 'gemini-2.5-flash',
  //       config: {
  //         systemInstruction: systemPrompt,
  //         temperature,
  //         maxOutputTokens: maxTokens,
  //         ...(topP !== undefined && { topP }),
  //         ...(presencePenalty !== undefined && { presencePenalty }),
  //         ...(frequencyPenalty !== undefined && { frequencyPenalty }),
  //       },
  //       contents: messages.map(m => ({
  //         role: m.role === 'assistant' ? 'model' : 'user',
  //         parts: [{ text: m.content }],
  //       })),
  //     });
  //     for await (const chunk of response) {
  //       if (chunk.text) callbacks.onToken(chunk.text);
  //     }
  //   },
  //   async generateText(prompt, maxTokens = 300) {
  //     const response = await client.models.generateContent({
  //       model: 'gemini-2.5-flash',
  //       contents: prompt,
  //     });
  //     return response.text ?? '';
  //   },
  // };
}

let cachedClient: LLMClient | null = null;

export async function getLLMClient(): Promise<LLMClient> {
  if (cachedClient) return cachedClient;

  const provider = getProvider();
  cachedClient =
    provider === 'openai'
      ? await createOpenAIClient()
      : await createGeminiClient();

  return cachedClient;
}
