import Image, { StaticImageData } from 'next/image';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  characterName?: string;
  characterImage?: StaticImageData;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  characterName,
  characterImage,
  isStreaming = false,
}: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-zinc-900 px-4 py-3 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
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
        <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
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
