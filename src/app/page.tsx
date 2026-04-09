import { characters } from '@/data/characters';
import CharacterCard from '@/components/CharacterCard';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        AI 캐릭터 채팅
      </h1>
      <p className="mb-12 text-zinc-500 dark:text-zinc-400">
        대화하고 싶은 캐릭터를 선택하세요
      </p>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {characters.map(({ id, name, description, tags, profileEmoji }) => (
          <CharacterCard
            key={id}
            id={id}
            name={name}
            description={description}
            tags={tags}
            profileEmoji={profileEmoji}
          />
        ))}
      </div>
    </main>
  );
}
