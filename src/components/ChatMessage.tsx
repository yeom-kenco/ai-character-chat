'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { prepare, layout } from '@chenglou/pretext';

const PRETEXT_FONT = '14px Geist';
const PRETEXT_LINE_HEIGHT = 20;
const BUBBLE_PADDING_Y = 24;

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

function useBubbleHeight(content: string, bubbleWidth: number): number {
  return useMemo(() => {
    const trimmed = content.trimEnd();
    if (!trimmed || bubbleWidth <= 0) return 0;

    const textWidth = bubbleWidth - 32;
    const prepared = prepare(trimmed, PRETEXT_FONT, {
      whiteSpace: 'pre-wrap',
    });
    const result = layout(prepared, textWidth, PRETEXT_LINE_HEIGHT);
    return result.height + BUBBLE_PADDING_Y;
  }, [content, bubbleWidth]);
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
  const [bubbleWidth, setBubbleWidth] = useState(0);
  const bubbleRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setBubbleWidth(node.offsetWidth);
  }, []);
  const resizeRef = useRef<HTMLDivElement | null>(null);
  const preHeight = useBubbleHeight(content, bubbleWidth);

  useEffect(() => {
    const el = resizeRef.current;
    if (!el) return;

    let lastWidth = 0;
    const observer = new ResizeObserver(([entry]) => {
      const newWidth = Math.round(entry.contentRect.width + 32);
      if (newWidth !== lastWidth) {
        lastWidth = newWidth;
        setBubbleWidth(newWidth);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setBothRefs = useCallback(
    (node: HTMLDivElement | null) => {
      resizeRef.current = node;
      bubbleRef(node);
    },
    [bubbleRef],
  );

  if (role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div
          ref={setBothRefs}
          className="max-w-[75%] rounded-2xl rounded-br-sm bg-indigo-600/80 px-4 py-3 text-sm text-white"
          style={preHeight > 0 ? { minHeight: preHeight } : undefined}
        >
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
        <div
          ref={setBothRefs}
          className="rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white/90"
          style={preHeight > 0 ? { minHeight: preHeight } : undefined}
        >
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
