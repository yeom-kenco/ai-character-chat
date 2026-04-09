import { characters } from '@/data/characters';
import CharacterSelectGrid from '@/components/CharacterSelectGrid';
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

export default function Home() {
  const characterList = characters.map(
    ({ id, name, description, tags, greeting }) => ({
      id,
      name,
      description,
      tags,
      greeting,
      profileImage: profileImages[id],
    }),
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        AI 캐릭터 채팅
      </h1>
      <p className="mb-12 text-zinc-500 dark:text-zinc-400">
        대화하고 싶은 캐릭터를 선택하세요
      </p>
      <CharacterSelectGrid characters={characterList} />
    </main>
  );
}
