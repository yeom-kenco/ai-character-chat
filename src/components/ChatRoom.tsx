'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (!isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    isUserScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 100;
  };

  const handleSend = async (content: string) => {
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

    await streamChat({
      characterId,
      messages: apiMessages,
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
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (errorMsg) => {
        setIsStreaming(false);
        setError(errorMsg);
        setMessages((prev) => prev.slice(0, -1));
      },
    });
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
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {characterName}
        </h1>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
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
      </div>

      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
