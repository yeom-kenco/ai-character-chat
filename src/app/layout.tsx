import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '페르소나 — AI 캐릭터 채팅',
  description:
    '고유한 성격과 말투를 가진 AI 캐릭터와 자연스러운 대화를 나눠보세요.',
  openGraph: {
    title: '캐릭터 채팅 서비스: 페르소나 Persona',
    description: '그들이 당신을 기다리고 있어요. 오늘 밤, 누구와 이야기할까요?',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
