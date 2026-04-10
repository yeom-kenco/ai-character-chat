'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ErrorMessage from './ErrorMessage';
import { streamChat } from '@/lib/sse';
import type { Message } from '@/types/chat';

interface ChatRoomProps {
  characterId: string;
  characterName: string;
  characterDescription: string;
  characterImage: StaticImageData;
  accentColor: string;
  greeting: string;
}

export default function ChatRoom({
  characterId,
  characterName,
  characterDescription,
  characterImage,
  accentColor,
  greeting,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', role: 'assistant', content: greeting },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserContentRef = useRef<string>('');
  const rafRef = useRef<number>(0);

  const scrollToBottom = useCallback((smooth = true) => {
    if (isUserScrolledUpRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isStreaming) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    } else {
      scrollToBottom(true);
    }
  }, [messages, isStreaming, scrollToBottom]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    isUserScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  const handleNewChat = () => {
    abortControllerRef.current?.abort();
    setMessages([{ id: 'greeting', role: 'assistant', content: greeting }]);
    setSummary(undefined);
    setError(null);
    setIsStreaming(false);
  };

  const handleRetry = () => {
    if (lastUserContentRef.current) {
      handleSend(lastUserContentRef.current);
    }
  };

  const handleSend = async (content: string) => {
    lastUserContentRef.current = content;
    setError(null);

    const now = Date.now();

    const userMessage: Message = {
      id: `user-${now}`,
      role: 'user',
      content,
      timestamp: now,
    };

    const assistantMessage: Message = {
      id: `assistant-${now}`,
      role: 'assistant',
      content: '',
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);
    isUserScrolledUpRef.current = false;

    const apiMessages = [...messages, userMessage]
      .filter((m) => m.id !== 'greeting')
      .map(({ role, content: c }) => ({ role, content: c }));

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChat({
        characterId,
        messages: apiMessages,
        summary,
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
            return updated;
          });
        },
        onDone: () => {},
        onError: (errorMsg) => {
          setError(errorMsg);
          setMessages((prev) => prev.slice(0, -2));
        },
        onSummary: (newSummary) => {
          setSummary(newSummary);
        },
        onRetry: () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: '' };
            }
            return updated;
          });
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // 언마운트 또는 재전송 시 정상적으로 발생
      } else {
        const message =
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(message);
        setMessages((prev) => prev.slice(0, -2));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-[#0a0f1a]">
      <header>
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            aria-label="뒤로가기"
            className="rounded-lg p-1 text-white/50 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image
              src={characterImage}
              alt={characterName}
              fill
              className="object-cover object-top"
              sizes="36px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white/90">
              {characterName}
            </h1>
            <p className="truncate text-xs text-white/40">
              {characterDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isStreaming}
            className="rounded-lg px-3 py-1 text-xs font-medium text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            새 대화
          </button>
        </div>
        <div className="h-0.5" style={{ backgroundColor: accentColor }} />
      </header>

      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ overflowAnchor: 'none' }}
      >
        <div
          role="log"
          aria-live="polite"
          className="mx-auto flex max-w-3xl flex-col gap-4"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              characterName={
                message.role === 'assistant' ? characterName : undefined
              }
              characterImage={
                message.role === 'assistant' ? characterImage : undefined
              }
              isStreaming={
                isStreaming &&
                message.id === messages[messages.length - 1].id &&
                message.role === 'assistant'
              }
              onRegenerate={
                !isStreaming &&
                message.role === 'assistant' &&
                message.id === messages[messages.length - 1].id &&
                message.id !== 'greeting'
                  ? handleRetry
                  : undefined
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
