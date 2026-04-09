import { describe, it, expect } from 'vitest';
import {
  characters,
  getCharacterById,
  getCharacterIds,
} from '../characters';

const EXPECTED_IDS = ['luna', 'kai', 'miru', 'zero'];

const EXPECTED_SPECS: Record<string, { temperature: number; maxTokens: number }> = {
  luna: { temperature: 0.9, maxTokens: 300 },
  kai: { temperature: 0.6, maxTokens: 150 },
  miru: { temperature: 0.8, maxTokens: 250 },
  zero: { temperature: 0.5, maxTokens: 120 },
};

describe('characters array', () => {
  it('contains exactly 4 characters', () => {
    expect(characters).toHaveLength(4);
  });

  it('has all expected ids: luna, kai, miru, zero', () => {
    const ids = characters.map((c) => c.id);
    expect(ids).toEqual(EXPECTED_IDS);
  });

  it.each(EXPECTED_IDS)('character "%s" has all required fields with non-empty values', (id) => {
    const character = characters.find((c) => c.id === id)!;
    expect(character).toBeDefined();

    // String fields must be non-empty
    expect(character.id).toBeTruthy();
    expect(character.name).toBeTruthy();
    expect(character.description).toBeTruthy();
    expect(character.profileEmoji).toBeTruthy();
    expect(character.greeting).toBeTruthy();
    expect(character.systemPrompt).toBeTruthy();

    // tags must be a non-empty array of non-empty strings
    expect(character.tags.length).toBeGreaterThan(0);
    character.tags.forEach((tag) => {
      expect(tag).toBeTruthy();
    });
  });

  it.each(EXPECTED_IDS)('character "%s" has valid temperature (0-1)', (id) => {
    const character = characters.find((c) => c.id === id)!;
    expect(character.temperature).toBeGreaterThanOrEqual(0);
    expect(character.temperature).toBeLessThanOrEqual(1);
  });

  it.each(EXPECTED_IDS)('character "%s" has positive maxTokens', (id) => {
    const character = characters.find((c) => c.id === id)!;
    expect(character.maxTokens).toBeGreaterThan(0);
  });

  it.each(Object.entries(EXPECTED_SPECS))(
    'character "%s" matches PRD spec (temperature=%d, maxTokens=%d)',
    (id, spec) => {
      const character = characters.find((c) => c.id === id)!;
      expect(character.temperature).toBe(spec.temperature);
      expect(character.maxTokens).toBe(spec.maxTokens);
    },
  );

  it.each(EXPECTED_IDS)(
    'character "%s" systemPrompt contains all 5 layers',
    (id) => {
      const character = characters.find((c) => c.id === id)!;
      expect(character.systemPrompt).toContain('Layer 1');
      expect(character.systemPrompt).toContain('Layer 2');
      expect(character.systemPrompt).toContain('Layer 3');
      expect(character.systemPrompt).toContain('Layer 4');
      expect(character.systemPrompt).toContain('Layer 5');
    },
  );
});

describe('getCharacterById', () => {
  it.each(EXPECTED_IDS)('returns correct character for id "%s"', (id) => {
    const character = getCharacterById(id);
    expect(character).toBeDefined();
    expect(character!.id).toBe(id);
  });

  it('returns undefined for invalid id', () => {
    expect(getCharacterById('nonexistent')).toBeUndefined();
    expect(getCharacterById('')).toBeUndefined();
  });
});

describe('getCharacterIds', () => {
  it('returns all 4 character ids', () => {
    const ids = getCharacterIds();
    expect(ids).toEqual(EXPECTED_IDS);
    expect(ids).toHaveLength(4);
  });
});
