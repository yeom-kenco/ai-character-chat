import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
}
