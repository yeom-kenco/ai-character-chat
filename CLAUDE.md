@AGENTS.md

## 프로젝트 개요

AI 캐릭터 채팅 웹 서비스 — LLM API를 활용한 캐릭터 페르소나 대화 서비스.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript (strict)
- **스타일링**: TailwindCSS v4
- **LLM**: `src/lib/llm.ts`의 `getLLMClient()` 어댑터 경유 (현재 OpenAI, gpt-4o-mini). `LLM_PROVIDER` 환경변수로 프로바이더 전환.
- **테스트**: Vitest + Testing Library
- **배포**: Vercel

## 디렉토리 구조

```
src/
  app/                    # Next.js App Router 페이지
    api/chat/route.ts     # 채팅 API (SSE 스트리밍)
    chat/[characterId]/   # 채팅 화면
  components/             # React 컴포넌트
  data/characters.ts      # 캐릭터 정적 데이터 + 시스템 프롬프트
  lib/llm.ts              # LLMClient 어댑터 (프로바이더 분기, 싱글톤)
  lib/openai.ts           # OpenAI 클라이언트 (llm.ts에서만 동적 import)
  lib/context.ts          # 대화 컨텍스트/요약 (LLM 어댑터 경유)
  img/                    # 캐릭터 프로필 이미지
```

## 코딩 컨벤션

### 캐릭터 데이터
- 캐릭터 정보는 DB 없이 `src/data/characters.ts`에 정적으로 정의
- `systemPrompt`는 서버 사이드에서만 사용 — 클라이언트에 노출 금지
- 클라이언트에 전달할 때는 public 필드(id, name, description, tags, greeting)만 선별

### LLM 호출
- **`@/lib/openai`를 직접 import 금지** — route/context 등 호출처는 반드시 `getLLMClient()` 경유
- `openai.ts`는 `llm.ts`의 `createOpenAIClient()` 내부에서만 사용 (어댑터 활성화 이후 규약)
- 새 샘플링 파라미터(`topP`, `presencePenalty`, `frequencyPenalty`)는 `LLMClient.chatStream` 옵션에 추가해 확장. 캐릭터별 값은 `src/data/characters.ts`에 정의
- `getLLMClient()`는 비동기·싱글톤. 에러는 그대로 re-throw되므로 route의 재시도 로직(429/500/503/`Rate limit` 문자열 매칭)이 그대로 동작

### API
- 채팅 API는 SSE 스트리밍 (WebSocket 아님 — 1:1 AI 대화는 단방향 스트리밍으로 충분)
- SSE 에러 이벤트는 `event: error\n` 접두사로 정상 응답과 구분
- 환경변수 `OPENAI_API_KEY`(또는 프로바이더별 키)는 `.env.local`에서 관리. `LLM_PROVIDER` 미설정 시 기본값 `openai`

### 테스트
- 테스트 파일 위치: 대상 파일과 같은 디렉토리의 `__tests__/` 하위
- API route 테스트는 `// @vitest-environment node` 사용 (jsdom에서 NextRequest 미지원)
- 컴포넌트 테스트는 jsdom 환경 (기본값)
- vitest import는 사용하는 것만 명시적으로: `import { describe, it, expect, vi, afterEach } from 'vitest'`

### 컴포넌트
- 서버 컴포넌트 기본, 클라이언트 상태 필요한 부분만 `'use client'` 분리
- Next.js `Image` 컴포넌트로 이미지 최적화
- 시맨틱 HTML 사용 (`<article>`, `<main>`, `role="dialog"` 등)
