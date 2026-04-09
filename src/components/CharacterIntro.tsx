'use client';

import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface CharacterIntroProps {
  characterId: string;
  name: string;
  greeting: string;
  profileImage: StaticImageData;
  onClose: () => void;
}

export default function CharacterIntro({
  characterId,
  name,
  greeting,
  profileImage,
  onClose,
}: CharacterIntroProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    containerRef.current?.focus();
  }, []);

  const handleStart = () => {
    setVisible(false);
    setTimeout(() => {
      router.push(`/chat/${characterId}`);
    }, 400);
  };

  const handleBackdropClick = () => {
    setVisible(false);
    setTimeout(() => onClose(), 400);
  };

  return (
    <div
      role="dialog"
      aria-label={`${name} 소개`}
      tabIndex={-1}
      ref={containerRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !e.repeat) handleBackdropClick();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className="absolute inset-0 bg-black/90"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      <button
        type="button"
        onClick={handleBackdropClick}
        aria-label="닫기"
        className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8 px-6 sm:flex-row sm:items-center">
        <div className="relative h-72 w-56 shrink-0 overflow-hidden rounded-2xl sm:h-96 sm:w-72">
          <Image
            src={profileImage}
            alt={`${name} 프로필 이미지`}
            fill
            className="object-cover object-top"
            sizes="288px"
            priority
          />
        </div>

        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h2 className="mb-4 text-2xl font-bold text-white">{name}</h2>
          <p className="mb-8 max-w-sm text-lg leading-relaxed text-zinc-300">
            &ldquo;{greeting}&rdquo;
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            대화 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
