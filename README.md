# Persona - AI Character Chat

LLM 기반 캐릭터 페르소나 대화 서비스. 각각 고유한 성격, 말투, 감정 반응을 가진 AI 캐릭터와 실시간으로 대화합니다.


https://github.com/user-attachments/assets/5e0c8875-3f2a-4642-b6a8-b79a96eeb562



## Characters

| 캐릭터 | 설명 | 성격 |
|--------|------|------|
| **루나** | 별빛 아래 시를 쓰는 감성적인 시인 | 따뜻함, 감성, 공감 |
| **카이** | 세상을 꿰뚫어 보는 냉소적인 천재 | 논리적, 도발적, 직설적 |
| **미루** | 세상 모든 것이 궁금한 활발한 대학생 | 밝음, 호기심, 수다 |
| **제로** | 디지털 세계의 그림자 속 미스터리한 해커 | 차분함, 비밀주의, 관찰자 |

각 캐릭터는 OCEAN 성격 모델 기반 시스템 프롬프트로 말투, 호칭, 감정 반응이 일관되게 유지됩니다.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS v4
- **LLM**: OpenAI API (gpt-4o-mini)
- **Test**: Vitest + Testing Library
- **Deploy**: Vercel

## Getting Started

```bash
npm install
```

`.env.local` 파일을 생성하고 OpenAI API 키를 설정합니다.

```
OPENAI_API_KEY=sk-...
```

개발 서버를 실행합니다.

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm test` | 테스트 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷팅 |

## Project Structure

```
src/
  app/                    # Next.js App Router
    api/chat/route.ts     # 채팅 API (SSE 스트리밍)
    chat/[characterId]/   # 채팅 페이지
  components/             # React 컴포넌트
  data/characters.ts      # 캐릭터 데이터 + 시스템 프롬프트
  lib/                    # OpenAI 클라이언트, SSE, 컨텍스트 관리
  img/                    # 캐릭터 프로필 이미지
```

## Features

- **SSE 스트리밍**: 실시간 토큰 단위 응답 표시
- **캐릭터별 페르소나**: 성격, 말투, 호칭, 감정 반응이 캐릭터마다 다름
- **사용자 이름 호칭**: 입력한 이름을 캐릭터 성격에 맞게 부름
- **대화 컨텍스트 관리**: 긴 대화 시 자동 요약으로 컨텍스트 유지
- **인트로 스킵**: 한번 본 인트로는 재방문 시 자동 스킵
- **다크 테마 UI**: 커스텀 스크롤바, 눈 내리는 배경 효과
