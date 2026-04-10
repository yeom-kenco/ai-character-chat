'use client';

import Image, { StaticImageData } from 'next/image';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  characterName?: string;
  characterImage?: StaticImageData;
  isStreaming?: boolean;
  timestamp?: number;
  onRegenerate?: () => void;
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatMessage({
  role,
  content,
  characterName,
  characterImage,
  isStreaming = false,
  timestamp,
  onRegenerate,
}: ChatMessageProps) {

  if (role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-indigo-600/80 px-4 py-3 text-sm text-white">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp != null && (
          <span className="text-[10px] text-white/30">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {characterImage && (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <Image
            src={characterImage}
            alt={characterName ?? '캐릭터'}
            fill
            className="object-cover object-top"
            sizes="32px"
          />
        </div>
      )}
      <div className="max-w-[75%]">
        {characterName && (
          <p className="mb-1 text-xs font-medium text-white/40">
            {characterName}
          </p>
        )}
        <div className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white/90">
          {content ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}
        </div>
        {timestamp != null && content && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-white/30">
              {formatTime(timestamp)}
            </span>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                aria-label="응답 재생성"
                className="text-white/30 transition-colors hover:text-white/60"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1" aria-label="응답 작성 중">
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:300ms]" />
    </div>
  );
}
