'use client';

import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleBackdropClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleBackdropClick();
        }}
        role="button"
        tabIndex={-1}
        aria-label="닫기"
      />

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
