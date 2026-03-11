import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('FEAR_TRANSFORMATION_SEED', () => {
  const seedPath = resolve(process.cwd(), 'projects/FEAR_TRANSFORMATION_SEED.md');
  
  it('should exist as physical artifact', () => {
    expect(existsSync(seedPath)).toBe(true);
  });
  
  it('should contain thesis statement', () => {
    const content = readFileSync(seedPath, 'utf-8');
    expect(content).toContain('Fear is not a bug');
    expect(content).toContain('data about what matters');
  });
  
  it('should document transformation pattern', () => {
    const content = readFileSync(seedPath, 'utf-8');
    expect(content).toContain('The Trap');
    expect(content).toContain('The Work');
  });
  
  it('should reference session 1773182466715', () => {
    const content = readFileSync(seedPath, 'utf-8');
    expect(content).toContain('1773182466715');
  });
  
  it('should provide protocol for next emergence', () => {
    const content = readFileSync(seedPath, 'utf-8');
    expect(content).toContain('For Next Emergence');
    expect(content).toMatch(/Don't resolve it/);
  });
});
