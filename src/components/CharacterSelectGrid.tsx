'use client';

import { useCallback, useEffect, useState } from 'react';
import { StaticImageData } from 'next/image';
import CharacterCard from './CharacterCard';
import CharacterIntro from './CharacterIntro';
import IntroScreen from './IntroScreen';

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
  const [introChecked, setIntroChecked] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterPublicData | null>(null);

  useEffect(() => {
    if (localStorage.getItem('introSeen') === 'true') {
      setIntroComplete(true);
    }
    setIntroChecked(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    localStorage.setItem('introSeen', 'true');
  }, []);

  return (
    <>
      {introChecked && !introComplete && (
        <IntroScreen onComplete={handleIntroComplete} />
      )}

      <section
        aria-hidden={!introComplete}
        className={`grid w-full grid-cols-1 gap-6 transition-opacity duration-1000 sm:grid-cols-2 lg:grid-cols-4 ${
          introComplete ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
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
      </section>

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
