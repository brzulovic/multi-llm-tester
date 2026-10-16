import { describe, it, expect } from 'vitest';
import { tokenizeText, computeTokenDiff } from './diff';

describe('Token-level Diff Utility', () => {
  it('tokenizes text while preserving whitespace and words', () => {
    const text = 'Hello, world! 123';
    const tokens = tokenizeText(text);
    expect(tokens).toEqual(['Hello', ',', ' ', 'world', '!', ' ', '123']);
  });

  it('detects identical outputs with 100% similarity', () => {
    const text = 'Identical prompt response.';
    const result = computeTokenDiff(text, text);
    expect(result.metrics.similarityPercentage).toBe(100);
    expect(result.metrics.removedTokens).toBe(0);
    expect(result.metrics.addedTokens).toBe(0);
  });

  it('identifies token-level differences between two model outputs', () => {
    const textA = 'The quick brown fox jumps.';
    const textB = 'The fast brown fox leaped.';
    const result = computeTokenDiff(textA, textB);

    expect(result.metrics.removedTokens).toBeGreaterThan(0);
    expect(result.metrics.addedTokens).toBeGreaterThan(0);
    expect(result.tokensAWithDiff.some(t => t.type === 'removed' && t.value === 'quick')).toBe(true);
    expect(result.tokensBWithDiff.some(t => t.type === 'added' && t.value === 'fast')).toBe(true);
  });
});
