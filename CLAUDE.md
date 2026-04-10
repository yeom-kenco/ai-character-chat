@AGENTS.md

## 프로젝트 개요

AI 캐릭터 채팅 웹 서비스 — LLM API를 활용한 캐릭터 페르소나 대화 서비스.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript (strict)
- **스타일링**: TailwindCSS v4
- **LLM**: OpenAI API (openai, gpt-4o-mini)
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
  lib/openai.ts           # OpenAI 클라이언트
  img/                    # 캐릭터 프로필 이미지
```

## 코딩 컨벤션

### 캐릭터 데이터
- 캐릭터 정보는 DB 없이 `src/data/characters.ts`에 정적으로 정의
- `systemPrompt`는 서버 사이드에서만 사용 — 클라이언트에 노출 금지
- 클라이언트에 전달할 때는 public 필드(id, name, description, tags, greeting)만 선별

### API
- 채팅 API는 SSE 스트리밍 (WebSocket 아님 — 1:1 AI 대화는 단방향 스트리밍으로 충분)
- SSE 에러 이벤트는 `event: error\n` 접두사로 정상 응답과 구분
- 환경변수 `OPENAI_API_KEY`는 `.env.local`에서 관리

### 테스트
- 테스트 파일 위치: 대상 파일과 같은 디렉토리의 `__tests__/` 하위
- API route 테스트는 `// @vitest-environment node` 사용 (jsdom에서 NextRequest 미지원)
- 컴포넌트 테스트는 jsdom 환경 (기본값)
- vitest import는 사용하는 것만 명시적으로: `import { describe, it, expect, vi, afterEach } from 'vitest'`

### 컴포넌트
- 서버 컴포넌트 기본, 클라이언트 상태 필요한 부분만 `'use client'` 분리
- Next.js `Image` 컴포넌트로 이미지 최적화
- 시맨틱 HTML 사용 (`<article>`, `<main>`, `role="dialog"` 등)
