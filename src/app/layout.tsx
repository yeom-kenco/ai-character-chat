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
  title: 'AI 캐릭터 채팅',
  description:
    '고유한 성격과 말투를 가진 AI 캐릭터와 자연스러운 대화를 나눠보세요.',
  openGraph: {
    title: 'AI 캐릭터 채팅',
    description:
      '고유한 성격과 말투를 가진 AI 캐릭터와 자연스러운 대화를 나눠보세요.',
    type: 'website',
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
