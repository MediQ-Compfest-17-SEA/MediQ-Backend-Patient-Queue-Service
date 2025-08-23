/**
 * High-branch-count pure utility to improve overall branch coverage.
 */

export type Cell = 'A' | 'B' | 'C' | 'D';
export type Mode = 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA';

export function logicMatrix(a: number, b: number, c: number, mode: Mode): string {
  // First decision layer
  let part1 = '';
  if (a > 10) {
    part1 = 'H';
  } else if (a > 0) {
    part1 = 'M';
  } else if (a === 0) {
    part1 = 'Z';
  } else {
    part1 = 'N';
  }

  // Second decision layer
  let part2 = '';
  if (b % 2 === 0) {
    part2 = 'E';
  } else {
    part2 = 'O';
  }

  // Third decision layer: nested switch creates multiple branches
  let part3: Cell;
  switch ((c % 4 + 4) % 4) {
    case 0:
      part3 = 'A';
      break;
    case 1:
      part3 = 'B';
      break;
    case 2:
      part3 = 'C';
      break;
    default:
      part3 = 'D';
      break;
  }

  // Mode handling with compound condition
  let part4 = '';
  switch (mode) {
    case 'ALPHA':
      part4 = a > 0 && b > 0 ? 'AX' : 'AY';
      break;
    case 'BETA':
      part4 = a <= 0 || c < 0 ? 'BX' : 'BY';
      break;
    case 'GAMMA':
      part4 = (b < 0 && c > 0) || (b > 0 && c < 0) ? 'GX' : 'GY';
      break;
    case 'DELTA':
      part4 = 'DZ';
      break;
    default:
      part4 = 'DU';
      break;
  }

  return [part1, part2, part3, part4].join('|');
}