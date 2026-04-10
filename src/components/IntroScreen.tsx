'use client';

import { useEffect, useState } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'done'>('visible');

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 2500);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-[1500ms] ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #111827 50%, #0a0f1a 100%)' }}
    >
      <div
        className={`flex flex-col items-center gap-6 text-center transition-all duration-[1500ms] ${
          phase === 'fading' ? 'scale-105 blur-md' : 'scale-100 blur-0'
        }`}
      >
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{
            color: '#f0f4ff',
            textShadow:
              '0 0 15px rgba(180, 200, 255, 0.5), 0 0 60px rgba(140, 160, 255, 0.25), 0 0 120px rgba(120, 140, 255, 0.15)',
          }}
        >
          페르소나
        </h1>
        <p
          className="text-xl font-light leading-relaxed"
          style={{
            color: '#b0bcd8',
            textShadow: '0 0 10px rgba(180, 200, 255, 0.15)',
          }}
        >
          그들이 당신을 기다리고 있어요.
          <br />
          오늘 밤, 누구와 이야기할까요?
        </p>
      </div>
    </div>
  );
}
