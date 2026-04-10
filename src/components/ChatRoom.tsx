'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ErrorMessage from './ErrorMessage';
import { streamChat } from '@/lib/sse';
import type { Message } from '@/types/chat';

interface ChatRoomProps {
  characterId: string;
  characterName: string;
  characterImage: StaticImageData;
  greeting: string;
}

export default function ChatRoom({
  characterId,
  characterName,
  characterImage,
  greeting,
}: ChatRoomProps) {
  const initialMessages: Message[] = [
    { id: 'greeting', role: 'assistant', content: greeting },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserContentRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    if (!isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
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
    setMessages(initialMessages);
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

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
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
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <Link
          href="/"
          aria-label="뒤로가기"
          className="rounded-lg p-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
        <h1 className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {characterName}
        </h1>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={isStreaming}
          className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          새 대화
        </button>
      </header>

      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
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
