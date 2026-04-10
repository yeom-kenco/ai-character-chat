import { characters } from '@/data/characters';
import CharacterSelectGrid from '@/components/CharacterSelectGrid';
import SnowBackground from '@/components/GradientBackground';
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
    <>
      <SnowBackground />
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 py-16">
        <h1 className="text-glow mb-2 text-4xl font-bold tracking-tight">
          페르소나
        </h1>
        <p className="text-glow-subtle mb-12 text-sm">
          오늘은 누구와 대화하러 갈까요?
        </p>
        <CharacterSelectGrid characters={characterList} />
      </main>
    </>
  );
}
