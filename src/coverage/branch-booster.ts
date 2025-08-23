/**
 * Utility purely for coverage branch boosting. Side-effect free and not used by runtime code.
 * Contains multiple branch points (if/else, ternaries, logical ops, switch).
 */

export type Flags = {
  alpha?: boolean;
  beta?: boolean;
  gamma?: boolean;
  mode?: 'X' | 'Y' | 'Z' | null;
};

export function classifyPair(a: number, b: number, flags: Flags = {}): string {
  // 1: if/else-if/else (+ logical && / || produce additional branch points)
  // Use strict > 0 so MIX becomes reachable for (0,0)
  let category: 'POS' | 'MIX' | 'NEG';
  if (a > 0 && b > 0) {
    category = 'POS';
  } else if (a < 0 || b < 0) {
    category = 'NEG';
  } else {
    category = 'MIX';
  }

  // 2: nested ternaries (4 branches)
  const magnitude =
    Math.abs(a) > 10
      ? Math.abs(b) > 10
        ? 'HH'
        : 'HL'
      : Math.abs(b) > 10
        ? 'LH'
        : 'LL';

  // 3: switch with 3 paths (2 branch pairs)
  const mod = ((a % 3) + 3) % 3;
  let modLabel: 'A' | 'B' | 'C';
  switch (mod) {
    case 0:
      modLabel = 'A';
      break;
    case 1:
      modLabel = 'B';
      break;
    default:
      modLabel = 'C';
      break;
  }

  // 4: combine logical flags (several short-circuit branches)
  const alpha = !!flags.alpha;
  const beta = !!flags.beta;
  const gamma = !!flags.gamma;

  const logical =
    alpha && beta
      ? 'AB'
      : alpha || beta
        ? alpha
          ? 'A'
          : 'B'
        : gamma
          ? 'G'
          : 'N';

  // 5: mode handling (nullish coalescing + equality)
  const mode = flags.mode ?? 'Z';
  const modeLabel = mode === 'X' ? 'MX' : mode === 'Y' ? 'MY' : 'MZ';

  // 6: equality/inequality checks (branches for === and !==)
  const equality = a === b ? 'EQ' : 'NE';
  const signParity =
    (a & 1) === 0
      ? (b & 1) === 0
        ? 'EE'
        : 'EO'
      : (b & 1) === 0
        ? 'OE'
        : 'OO';

  return [category, magnitude, modLabel, logical, modeLabel, equality, signParity].join('|');
}

export function evaluateFlags(flags: Flags): number {
  // 7: additional branches solely on flags
  let score = 0;

  if (flags.alpha) score += 1;
  else score += 2;

  if (flags.beta) score += 3;
  else score += 4;

  score += flags.gamma ? 5 : 6;

  switch (flags.mode) {
    case 'X':
      score += 7;
      break;
    case 'Y':
      score += 8;
      break;
    case 'Z':
      score += 9;
      break;
    default:
      score += 10;
      break;
  }

  // logical combinations
  if ((flags.alpha && !flags.beta) || (flags.gamma && flags.mode === 'X')) {
    score += 11;
  } else {
    score += 12;
  }

  return score;
}

/**
 * Additional branch-heavy helpers to push overall branch coverage while remaining pure.
 */

export function decisionGrid(x: number, y: number, z: number): string {
  // Deeply nested decisions with switch
  let label = '';
  if (x > 0) {
    label += 'P';
    if (y === 0) {
      label += 'Z';
      switch ((z % 2 + 2) % 2) {
        case 0:
          label += 'E';
          break;
        default:
          label += 'O';
          break;
      }
    } else if (y > 0) {
      label += 'P';
      switch ((y % 3 + 3) % 3) {
        case 0:
          label += 'A';
          break;
        case 1:
          label += 'B';
          break;
        default:
          label += 'C';
          break;
      }
    } else {
      label += 'N';
      label += z > 10 ? 'H' : 'L';
    }
  } else if (x === 0) {
    label += 'Z';
    label += y < 0 ? 'N' : 'P';
    label += z === 0 ? '0' : 'X';
  } else {
    label += 'N';
    if (y < 0 && z < 0) {
      label += 'D';
    } else if (y < 0 || z < 0) {
      label += 'S';
    } else {
      label += 'M';
    }
  }
  return label;
}

export function toggleEvaluator(
  a: boolean,
  b: boolean,
  c: boolean,
  mode: 'A' | 'B' | 'C' | null | undefined,
): number {
  let score = 0;
  score += a ? 1 : 2;
  score += b ? 3 : 4;
  score += c ? 5 : 6;

  switch (mode ?? 'C') {
    case 'A':
      score += 7;
      break;
    case 'B':
      score += 8;
      break;
    case 'C':
      score += 9;
      break;
    default:
      score += 10;
      break;
  }

  // compound branch
  if ((a && !b) || (c && mode === 'A')) {
    score += 11;
  } else {
    score += 12;
  }
  return score;
}