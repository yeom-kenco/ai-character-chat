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
      characterImage={profileImages[character.id]}
      greeting={character.greeting}
    />
  );
}
