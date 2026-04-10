import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCharacterById, getCharacterIds } from '@/data/characters';
import ChatRoom from '@/components/ChatRoom';
import lunaImg from '@/img/luna.png';
import kaiImg from '@/img/kai.png';
import miruImg from '@/img/miru.png';
import zeroImg from '@/img/zero.png';
import { StaticImageData } from 'next/image';

const profileImages: Record<string, StaticImageData> = {
  luna: lunaImg,
  kai: kaiImg,
  miru: miruImg,
  zero: zeroImg,
};

export function generateStaticParams() {
  return getCharacterIds().map((id) => ({ characterId: id }));
}

interface ChatPageProps {
  params: Promise<{ characterId: string }>;
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { characterId } = await params;
  const character = getCharacterById(characterId);

  if (!character) return {};

  return {
    title: `${character.name}와 대화 — AI 캐릭터 채팅`,
    description: character.description,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { characterId } = await params;
  const character = getCharacterById(characterId);

  if (!character) {
    notFound();
  }

  return (
    <ChatRoom
      characterId={character.id}
      characterName={character.name}
      characterDescription={character.description}
      characterImage={profileImages[character.id]}
      accentColor={character.accentColor}
      greeting={character.greeting}
    />
  );
}
