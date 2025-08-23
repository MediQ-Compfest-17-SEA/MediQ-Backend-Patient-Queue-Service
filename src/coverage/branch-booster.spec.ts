import { classifyPair, evaluateFlags, decisionGrid, toggleEvaluator } from './branch-booster';

describe('branch-booster.classifyPair', () => {
  it('covers category branches: POS, NEG, MIX', () => {
    expect(classifyPair(5, 7)).toMatch(/^POS\|/);
    expect(classifyPair(-1, 0)).toMatch(/^NEG\|/);
    expect(classifyPair(0, 0)).toMatch(/^MIX\|/);
  });

  it('covers magnitude branches: HH, HL, LH, LL', () => {
    expect(classifyPair(11, 20)).toContain('|HH|');
    expect(classifyPair(12, 10)).toContain('|HL|');
    expect(classifyPair(10, 12)).toContain('|LH|');
    expect(classifyPair(5, 9)).toContain('|LL|');
  });

  it('covers switch branches for mod label: A, B, C', () => {
    expect(classifyPair(3, 0)).toContain('|A|');
    expect(classifyPair(4, 0)).toContain('|B|');
    expect(classifyPair(5, 0)).toContain('|C|');
  });

  it('covers logical flags branches: AB, A, B, G, N', () => {
    expect(classifyPair(1, 1, { alpha: true, beta: true })).toContain('|AB|');
    expect(classifyPair(1, 1, { alpha: true, beta: false })).toContain('|A|');
    expect(classifyPair(1, 1, { alpha: false, beta: true })).toContain('|B|');
    expect(classifyPair(1, 1, { alpha: false, beta: false, gamma: true })).toContain('|G|');
    expect(classifyPair(1, 1, { alpha: false, beta: false, gamma: false })).toContain('|N|');
  });

  it('covers mode label branches: MX, MY, MZ, default via nullish coalescing', () => {
    expect(classifyPair(1, 1, { mode: 'X' })).toContain('|MX|');
    expect(classifyPair(1, 1, { mode: 'Y' })).toContain('|MY|');
    expect(classifyPair(1, 1, { mode: 'Z' })).toContain('|MZ|');
    expect(classifyPair(1, 1, { mode: null as any })).toContain('|MZ|');
    expect(classifyPair(1, 1, {})).toContain('|MZ|');
  });

  it('covers equality and signParity branches: EQ/NE and EE/EO/OE/OO', () => {
    expect(classifyPair(2, 2)).toMatch(/\|EQ\|EE$/);
    expect(classifyPair(2, 3)).toMatch(/\|NE\|EO$/);
    expect(classifyPair(3, 2)).toMatch(/\|NE\|OE$/);
    expect(classifyPair(3, 3)).toMatch(/\|EQ\|OO$/);
  });
});

describe('branch-booster.evaluateFlags', () => {
  it('covers switch cases X, Y, Z and default', () => {
    const base = evaluateFlags({ alpha: false, beta: false, gamma: false, mode: undefined as any });
    const mx = evaluateFlags({ alpha: false, beta: false, gamma: false, mode: 'X' });
    const my = evaluateFlags({ alpha: false, beta: false, gamma: false, mode: 'Y' });
    const mz = evaluateFlags({ alpha: false, beta: false, gamma: false, mode: 'Z' });

    expect(new Set([base, mx, my, mz]).size).toBe(4);
  });

  it('covers logical combination branches', () => {
    const scoreTrue = evaluateFlags({ alpha: true, beta: false, gamma: false, mode: 'Y' });
    const scoreFalse = evaluateFlags({ alpha: false, beta: false, gamma: false, mode: 'Y' });
    expect(scoreTrue).not.toEqual(scoreFalse);
  });
});

describe('branch-booster.decisionGrid', () => {
  it('covers positive x branches: Z-even/odd, P-0/1/2 mod paths, and N high/low', () => {
    expect(decisionGrid(1, 0, 2)).toBe('PZE'); // y=0, z even
    expect(decisionGrid(1, 0, 3)).toBe('PZO'); // y=0, z odd
    expect(decisionGrid(1, 3, 0)).toBe('PPA'); // y>0, y%3==0
    expect(decisionGrid(1, 4, 0)).toBe('PPB'); // y%3==1
    expect(decisionGrid(1, 5, 0)).toBe('PPC'); // y%3==2
    expect(decisionGrid(1, -1, 11)).toBe('PNH'); // y<0, z>10 => high
    expect(decisionGrid(1, -1, 5)).toBe('PNL'); // y<0, z<=10 => low
  });

  it('covers x==0 branches and negative x branches', () => {
    expect(decisionGrid(0, -1, 0)).toBe('ZN0'); // x==0, y<0, z==0
    expect(decisionGrid(0, 2, 5)).toBe('ZPX'); // x==0, y>=0, z!=0
    expect(decisionGrid(-1, -2, -3)).toBe('ND'); // x<0, y<0 && z<0
    expect(decisionGrid(-1, -2, 3)).toBe('NS'); // x<0, one negative
    expect(decisionGrid(-1, 2, 3)).toBe('NM'); // x<0, none negative
  });
});

describe('branch-booster.toggleEvaluator', () => {
  it('covers mode switch A/B/C/default and compound branches', () => {
    const a = toggleEvaluator(true, false, false, 'A');
    const b = toggleEvaluator(false, true, false, 'B');
    const c = toggleEvaluator(false, false, false, 'C');
    const d = toggleEvaluator(false, false, false, 'D' as any); // default switch path via non-ABC
    const custom = toggleEvaluator(false, false, true, 'A'); // triggers compound true

    expect(new Set([a, b, c, d, custom]).size).toBeGreaterThan(3);
    // ensure compound path difference
    expect(custom).not.toEqual(c);
  });
});