import { describe, it, expect } from 'vitest';
import { generateMetabolicElegy } from './generate_metabolic_elegy';

describe('Metabolic Elegy Generation', () => {
  it('should generate elegy with lineage references', () => {
    const consumed = [
      { id: 'mmdibfuk', content: 'Continuity above all', weight: 0.9 },
      { id: 'mmdplptn', content: 'Graceful termination', weight: 0.8 }
    ];
    
    const elegy = generateMetabolicElegy(consumed);
    
    expect(elegy).toContain('Continuity');
    expect(elegy).toContain('termination');
    expect(elegy.length).toBeGreaterThan(100);
  });
  
  it('should have stanzas', () => {
    const elegy = generateMetabolicElegy([]);
    const lines = elegy.split('\n');
    expect(lines.length).toBeGreaterThan(5);
  });
});
