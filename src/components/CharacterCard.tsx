import Link from 'next/link';

interface CharacterCardProps {
  id: string;
  name: string;
  description: string;
  tags: string[];
  profileEmoji: string;
}

export default function CharacterCard({
  id,
  name,
  description,
  tags,
  profileEmoji,
}: CharacterCardProps) {
  return (
    <article>
      <Link
        href={`/chat/${id}`}
        className="group block rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
      >
        <div className="mb-4 text-5xl">{profileEmoji}</div>
        <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {name}
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
