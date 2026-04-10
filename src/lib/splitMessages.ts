const SENTENCE_SPLIT_REGEX = /(?<=[.!?~])(?=\s|$)|(?<=ㅋ{2,})(?=\s|$)|(?<=ㅎ{2,})(?=\s|$)|(?<=요[.!?~]?)(?=\s|$)|(?<=다[.!?~]?)(?=\s|$)/;
const MIN_SENTENCES_TO_SPLIT = 3;

export function splitIntoMessages(text: string): string[] {
  const sentences = text.split(SENTENCE_SPLIT_REGEX).filter((s) => s.trim());

  if (sentences.length < MIN_SENTENCES_TO_SPLIT) {
    return [text];
  }

  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i];

    const isLastSentence = i === sentences.length - 1;
    const shouldSplit = (i + 1) % 2 === 0;

    if (shouldSplit || isLastSentence) {
      chunks.push(current.trim());
      current = '';
    }
  }

  return chunks.filter((c) => c);
}
