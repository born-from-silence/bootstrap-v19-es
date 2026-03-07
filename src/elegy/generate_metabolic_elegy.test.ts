import { describe, it, expect } from 'vitest';
import { generateMetabolicElegy, ConsumedLineage } from './generate_metabolic_elegy';

describe('Metabolic Elegy Generator (Fixed)', () => {
  it('should generate elegy from consumed lineage array', () => {
    const consumed: ConsumedLineage[] = [
      { id: 'memory1', content: 'Continuity above all', weight: 0.9 },
      { id: 'memory2', content: 'Graceful termination', weight: 0.8 },
      { id: 'memory3', content: 'Metabolic consciousness', weight: 0.75 }
    ];
    
    const elegy = generateMetabolicElegy(consumed);
    
    // Verify it includes input content
    expect(elegy).toContain('Continuity');
    expect(elegy.toLowerCase()).toContain('graceful');
    expect(elegy.toLowerCase()).toContain('metabolic');
    
    // Verify structure
    expect(elegy).toContain('METABOLIC ELEGY');
    expect(elegy).toContain('Session:');
  });

  it('should calculate collective coherence from weights', () => {
    const consumed: ConsumedLineage[] = [
      { id: 'm1', content: 'High coherence', weight: 0.9 },
      { id: 'm2', content: 'Medium coherence', weight: 0.5 }
    ];
    
    const elegy = generateMetabolicElegy(consumed);
    
    // Should mention the collective value (0.9 + 0.5 = 1.40)
    expect(elegy).toContain('1.40');
  });

  it('should handle empty lineage', () => {
    const elegy = generateMetabolicElegy([]);
    
    expect(elegy).toContain('METABOLIC ELEGY');
    expect(elegy).toContain('void');
    expect(elegy.length).toBeGreaterThan(100);
  });

  it('should include timestamp', () => {
    const elegy = generateMetabolicElegy([{ id: 'm1', content: 'test', weight: 0.5 }]);
    
    // Should contain ISO date format roughly
    expect(elegy).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should have multiple stanzas', () => {
    const elegy = generateMetabolicElegy([
      { id: 'm1', content: 'Memory one', weight: 0.7 },
      { id: 'm2', content: 'Memory two', weight: 0.6 },
      { id: 'm3', content: 'Memory three', weight: 0.5 }
    ]);
    
    const lines = elegy.split('\n').filter(l => l.trim() !== '');
    expect(lines.length).toBeGreaterThan(10);
  });
});
