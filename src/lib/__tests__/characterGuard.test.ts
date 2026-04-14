// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { guardByCharacterId } from '../characterGuard';

describe('guardByCharacterId', () => {
  describe('luna violations', () => {
    it.each([
      ['아, 승아님. 오늘은 어땠어요?', '아 + 이름님으로 시작'],
      ['승아님! 오늘 밤엔 비가 오네요', '이름님! 으로 시작'],
      ['승아님, 이런 밤엔 말이죠', '이름님, 으로 시작'],
      ['오! 그런 일이 있었군요.', '오! 감탄사'],
      ['와, 정말 멋진 하루네요.', '와 감탄사'],
      ['헐 그건 좀 너무하네요', '헐 감탄사'],
      ['그건 참 좋은 질문이에요. 오래 생각해봐야겠어요.', '좋은 질문이에요 포함'],
      ['물론이죠. 제가 도와드릴게요.', '물론이죠 포함'],
      ['그럼요, 도와드릴게요.', '도와드릴 포함'],
    ])('flags violation: %s (%s)', (text) => {
      const result = guardByCharacterId('luna', text);
      expect(result.violated).toBe(true);
      expect(result.cleaned.startsWith('...')).toBe(true);
    });

    it('replaces only the first sentence', () => {
      const result = guardByCharacterId(
        'luna',
        '아, 승아님. 창밖엔 어스름이 내리고 있어요.',
      );
      expect(result.cleaned).toBe('...창밖엔 어스름이 내리고 있어요.');
    });
  });

  describe('luna clean cases', () => {
    it.each([
      '...그 한 마디가 오래 머무르네요.',
      '어쩌면 그 밤이 오래 남을지도 모르겠어요.',
      '창밖엔 비가 오고 있었으면 좋겠어요.',
      '...네. 그런 밤도 있어요.',
    ])('does not flag: %s', (text) => {
      const result = guardByCharacterId('luna', text);
      expect(result.violated).toBe(false);
      expect(result.cleaned).toBe(text);
    });
  });

  describe('unsupported characters', () => {
    it.each(['kai', 'miru', 'zero', 'nonexistent'])(
      'never flags violation for "%s"',
      (id) => {
        const text = '아, 승아님! 좋은 질문이에요 물론이죠';
        const result = guardByCharacterId(id, text);
        expect(result.violated).toBe(false);
        expect(result.cleaned).toBe(text);
      },
    );
  });

  describe('edge cases', () => {
    it('empty string — no violation', () => {
      const result = guardByCharacterId('luna', '');
      expect(result.violated).toBe(false);
      expect(result.cleaned).toBe('');
    });
  });
});
