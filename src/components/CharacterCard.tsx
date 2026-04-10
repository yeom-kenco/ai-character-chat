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
        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
          <h2 className="mb-1 text-lg font-bold text-white/90">
            {name}
          </h2>
          <p className="mb-4 flex-1 text-sm text-white/50">
            {description}
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60"
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
