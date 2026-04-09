import Image, { StaticImageData } from 'next/image';

interface CharacterCardProps {
  name: string;
  description: string;
  tags: string[];
  profileImage: StaticImageData;
  onClick: () => void;
}

export default function CharacterCard({
  name,
  description,
  tags,
  profileImage,
  onClick,
}: CharacterCardProps) {
  return (
    <article className="h-full">
      <button
        type="button"
        onClick={onClick}
        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-all hover:border-zinc-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
      >
        <div className="relative aspect-3/4 w-full overflow-hidden">
          <Image
            src={profileImage}
            alt={`${name} 프로필 이미지`}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {name}
          </h2>
          <p className="mb-4 flex-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </button>
    </article>
  );
}
