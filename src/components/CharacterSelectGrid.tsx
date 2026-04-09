'use client';

import { useState } from 'react';
import { StaticImageData } from 'next/image';
import CharacterCard from './CharacterCard';
import CharacterIntro from './CharacterIntro';

interface CharacterPublicData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  greeting: string;
  profileImage: StaticImageData;
}

interface CharacterSelectGridProps {
  characters: CharacterPublicData[];
}

export default function CharacterSelectGrid({
  characters,
}: CharacterSelectGridProps) {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterPublicData | null>(null);

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            name={character.name}
            description={character.description}
            tags={character.tags}
            profileImage={character.profileImage}
            onClick={() => setSelectedCharacter(character)}
          />
        ))}
      </div>

      {selectedCharacter && (
        <CharacterIntro
          characterId={selectedCharacter.id}
          name={selectedCharacter.name}
          greeting={selectedCharacter.greeting}
          profileImage={selectedCharacter.profileImage}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </>
  );
}
