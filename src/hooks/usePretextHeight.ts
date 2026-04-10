import { useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';

const FONT = '14px Geist';
const LINE_HEIGHT = 20;

export function usePretextHeight(
  text: string,
  maxWidth: number,
): number {
  return useMemo(() => {
    if (!text) return 0;

    const prepared = prepare(text, FONT, { whiteSpace: 'pre-wrap' });
    const result = layout(prepared, maxWidth, LINE_HEIGHT);
    return result.height;
  }, [text, maxWidth]);
}
