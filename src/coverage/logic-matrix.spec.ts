import { logicMatrix, Mode } from './logic-matrix';

describe('logic-matrix.logicMatrix', () => {
  it('covers part1 branches: H, M, Z, N', () => {
    expect(logicMatrix(11, 0, 0, 'DELTA')).toMatch(/^H\|/); // a > 10 => H
    expect(logicMatrix(5, 0, 0, 'DELTA')).toMatch(/^M\|/);  // a > 0 => M
    expect(logicMatrix(0, 0, 0, 'DELTA')).toMatch(/^Z\|/);  // a === 0 => Z
    expect(logicMatrix(-1, 0, 0, 'DELTA')).toMatch(/^N\|/); // a < 0 => N
  });

  it('covers part2 branches: even/odd for b', () => {
    expect(logicMatrix(1, 2, 0, 'DELTA')).toMatch(/^\w\|E\|/); // even
    expect(logicMatrix(1, 3, 0, 'DELTA')).toMatch(/^\w\|O\|/); // odd
  });

  it('covers part3 switch branches: A, B, C, D (c % 4)', () => {
    expect(logicMatrix(1, 2, 0, 'DELTA')).toMatch(/\|A\|/); // 0 -> A
    expect(logicMatrix(1, 2, 1, 'DELTA')).toMatch(/\|B\|/); // 1 -> B
    expect(logicMatrix(1, 2, 2, 'DELTA')).toMatch(/\|C\|/); // 2 -> C
    expect(logicMatrix(1, 2, 3, 'DELTA')).toMatch(/\|D\|/); // 3 -> D
  });

  it('covers ALPHA mode compound: AX vs AY', () => {
    // a > 0 && b > 0 => AX
    expect(logicMatrix(1, 1, 0, 'ALPHA')).toMatch(/\|AX$/);
    // else => AY (e.g., b <= 0)
    expect(logicMatrix(1, 0, 0, 'ALPHA')).toMatch(/\|AY$/);
  });

  it('covers BETA mode compound: BX vs BY', () => {
    // (a <= 0) true => BX
    expect(logicMatrix(0, 1, 1, 'BETA')).toMatch(/\|BX$/);
    // (a <= 0 || c < 0) false => BY
    expect(logicMatrix(2, 1, 1, 'BETA')).toMatch(/\|BY$/);
  });

  it('covers GAMMA mode compound: GX vs GY', () => {
    // (b < 0 && c > 0) true
    expect(logicMatrix(1, -1, 2, 'GAMMA')).toMatch(/\|GX$/);
    // (b > 0 && c < 0) true
    expect(logicMatrix(1, 1, -2, 'GAMMA')).toMatch(/\|GX$/);
    // else => GY
    expect(logicMatrix(1, 1, 2, 'GAMMA')).toMatch(/\|GY$/);
  });

  it('covers DELTA mode path', () => {
    expect(logicMatrix(1, 1, 1, 'DELTA')).toMatch(/\|DZ$/);
  });
});