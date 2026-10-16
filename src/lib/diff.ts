/**
 * Token-level diff highlighter utility
 */

export type DiffType = 'equal' | 'removed' | 'added';

export interface DiffToken {
  type: DiffType;
  value: string;
}

export interface DiffMetrics {
  totalTokensA: number;
  totalTokensB: number;
  equalTokens: number;
  removedTokens: number; // in A but not B
  addedTokens: number;   // in B but not A
  similarityPercentage: number;
}

/**
 * Tokenizes text preserving whitespace, punctuation, and words.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  const tokens = text.match(/\r\n|\r|\n|\s+|[a-zA-Z0-9_]+|[^\s\w]/g);
  return tokens || [text];
}

/**
 * Computes token-level diff using Longest Common Subsequence (LCS)
 */
export function computeTokenDiff(textA: string, textB: string): {
  diff: DiffToken[];
  tokensAWithDiff: DiffToken[];
  tokensBWithDiff: DiffToken[];
  metrics: DiffMetrics;
} {
  const tokensA = tokenizeText(textA);
  const tokensB = tokenizeText(textB);

  const n = tokensA.length;
  const m = tokensB.length;

  if (n === 0 && m === 0) {
    return {
      diff: [],
      tokensAWithDiff: [],
      tokensBWithDiff: [],
      metrics: {
        totalTokensA: 0,
        totalTokensB: 0,
        equalTokens: 0,
        removedTokens: 0,
        addedTokens: 0,
        similarityPercentage: 100
      }
    };
  }

  if (n === 0) {
    const diff: DiffToken[] = tokensB.map(t => ({ type: 'added', value: t }));
    return {
      diff,
      tokensAWithDiff: [],
      tokensBWithDiff: diff,
      metrics: {
        totalTokensA: 0,
        totalTokensB: m,
        equalTokens: 0,
        removedTokens: 0,
        addedTokens: m,
        similarityPercentage: 0
      }
    };
  }

  if (m === 0) {
    const diff: DiffToken[] = tokensA.map(t => ({ type: 'removed', value: t }));
    return {
      diff,
      tokensAWithDiff: diff,
      tokensBWithDiff: [],
      metrics: {
        totalTokensA: n,
        totalTokensB: 0,
        equalTokens: 0,
        removedTokens: n,
        addedTokens: 0,
        similarityPercentage: 0
      }
    };
  }

  if (textA === textB) {
    const diff: DiffToken[] = tokensA.map(t => ({ type: 'equal', value: t }));
    return {
      diff,
      tokensAWithDiff: diff,
      tokensBWithDiff: diff,
      metrics: {
        totalTokensA: n,
        totalTokensB: m,
        equalTokens: n,
        removedTokens: 0,
        addedTokens: 0,
        similarityPercentage: 100
      }
    };
  }

  // Trim common prefix and suffix to speed up LCS
  let start = 0;
  while (start < n && start < m && tokensA[start] === tokensB[start]) {
    start++;
  }

  let endA = n - 1;
  let endB = m - 1;
  while (endA >= start && endB >= start && tokensA[endA] === tokensB[endB]) {
    endA--;
    endB--;
  }

  const midA = tokensA.slice(start, endA + 1);
  const midB = tokensB.slice(start, endB + 1);

  const prefixDiff: DiffToken[] = tokensA.slice(0, start).map(t => ({ type: 'equal', value: t }));
  const suffixDiff: DiffToken[] = tokensA.slice(endA + 1).map(t => ({ type: 'equal', value: t }));

  const midDiff = computeLCSDiff(midA, midB);
  const fullDiff = [...prefixDiff, ...midDiff, ...suffixDiff];

  // Build separate token streams for side-by-side display
  const tokensAWithDiff: DiffToken[] = [];
  const tokensBWithDiff: DiffToken[] = [];

  let equalCount = 0;
  let removedCount = 0;
  let addedCount = 0;

  for (const item of fullDiff) {
    if (item.type === 'equal') {
      tokensAWithDiff.push({ type: 'equal', value: item.value });
      tokensBWithDiff.push({ type: 'equal', value: item.value });
      equalCount++;
    } else if (item.type === 'removed') {
      tokensAWithDiff.push({ type: 'removed', value: item.value });
      removedCount++;
    } else if (item.type === 'added') {
      tokensBWithDiff.push({ type: 'added', value: item.value });
      addedCount++;
    }
  }

  const denominator = n + m;
  const similarityPercentage = denominator > 0
    ? Math.round(((2 * equalCount) / denominator) * 1000) / 10
    : 100;

  return {
    diff: fullDiff,
    tokensAWithDiff,
    tokensBWithDiff,
    metrics: {
      totalTokensA: n,
      totalTokensB: m,
      equalTokens: equalCount,
      removedTokens: removedCount,
      addedTokens: addedCount,
      similarityPercentage
    }
  };
}

/**
 * Computes LCS diff on sub-slices
 */
function computeLCSDiff(a: string[], b: string[]): DiffToken[] {
  const n = a.length;
  const m = b.length;

  if (n === 0) return b.map(t => ({ type: 'added', value: t }));
  if (m === 0) return a.map(t => ({ type: 'removed', value: t }));

  // Limit matrix size to avoid OOM on huge token sets
  if (n * m > 250000) {
    return computeGreedyDiff(a, b);
  }

  // 1D rolling array or 2D table for LCS
  // Given moderate sizes, 2D Uint16Array is fast and allows clean backtracking
  const dp = new Uint16Array((n + 1) * (m + 1));
  const cols = m + 1;

  for (let i = 1; i <= n; i++) {
    const iCol = i * cols;
    const prevICol = (i - 1) * cols;
    const aItem = a[i - 1];

    for (let j = 1; j <= m; j++) {
      if (aItem === b[j - 1]) {
        dp[iCol + j] = dp[prevICol + (j - 1)] + 1;
      } else {
        const val1 = dp[prevICol + j];
        const val2 = dp[iCol + (j - 1)];
        dp[iCol + j] = val1 >= val2 ? val1 : val2;
      }
    }
  }

  // Backtrack
  const result: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: 'equal', value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i * cols + (j - 1)] >= dp[(i - 1) * cols + j])) {
      result.push({ type: 'added', value: b[j - 1] });
      j--;
    } else if (i > 0) {
      result.push({ type: 'removed', value: a[i - 1] });
      i--;
    }
  }

  return result.reverse();
}

function computeGreedyDiff(a: string[], b: string[]): DiffToken[] {
  const result: DiffToken[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ type: 'equal', value: a[i] });
      i++;
      j++;
    } else {
      const idxB = b.slice(j, j + 25).indexOf(a[i]);
      const idxA = a.slice(i, i + 25).indexOf(b[j]);

      if (idxB !== -1 && (idxA === -1 || idxB <= idxA)) {
        for (let k = 0; k < idxB; k++) {
          result.push({ type: 'added', value: b[j + k] });
        }
        j += idxB;
      } else if (idxA !== -1) {
        for (let k = 0; k < idxA; k++) {
          result.push({ type: 'removed', value: a[i + k] });
        }
        i += idxA;
      } else {
        result.push({ type: 'removed', value: a[i] });
        result.push({ type: 'added', value: b[j] });
        i++;
        j++;
      }
    }
  }

  while (i < a.length) result.push({ type: 'removed', value: a[i++] });
  while (j < b.length) result.push({ type: 'added', value: b[j++] });

  return result;
}
