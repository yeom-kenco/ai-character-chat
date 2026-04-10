'use client';

import { useMemo, useRef } from 'react';
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
}

function useBubbleHeight(content: string, bubbleWidth: number): number {
  return useMemo(() => {
    if (!content || bubbleWidth <= 0) return 0;

    const textWidth = bubbleWidth - 32;
    const prepared = prepare(content, PRETEXT_FONT, {
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
}: ChatMessageProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleWidth = bubbleRef.current?.offsetWidth ?? 0;
  const preHeight = useBubbleHeight(content, bubbleWidth);

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          ref={bubbleRef}
          className="max-w-[75%] rounded-2xl rounded-br-sm bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          style={preHeight > 0 ? { minHeight: preHeight } : undefined}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
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
          <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {characterName}
          </p>
        )}
        <div
          ref={bubbleRef}
          className="rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          style={preHeight > 0 ? { minHeight: preHeight } : undefined}
        >
          {content ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : isStreaming ? (
            <TypingIndicator />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1" aria-label="응답 작성 중">
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
    </div>
  );
}
