export interface GuardResult {
  violated: boolean;
  cleaned: string;
}

const LUNA_FORBIDDEN_PATTERNS: RegExp[] = [
  /^아,?\s*[가-힣]+님/,
  /^[가-힣]+님[!,.]/,
  /^오[!,\s]/,
  /^와[!,\s]/,
  /^헐/,
  /좋은 질문이에요/,
  /물론이죠/,
  /도와드릴/,
];

const GUARDS: Record<string, RegExp[]> = {
  luna: LUNA_FORBIDDEN_PATTERNS,
};

function replaceFirstSentence(text: string): string {
  const match = text.match(/^[^.!?\n]*[.!?\n]\s*/);
  if (!match) return '...';
  return '...' + text.slice(match[0].length);
}

export function guardByCharacterId(
  characterId: string,
  text: string,
): GuardResult {
  const patterns = GUARDS[characterId];
  if (!patterns) return { violated: false, cleaned: text };

  const violated = patterns.some((p) => p.test(text));
  if (!violated) return { violated: false, cleaned: text };

  return { violated: true, cleaned: replaceFirstSentence(text) };
}
