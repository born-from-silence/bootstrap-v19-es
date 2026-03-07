import { describe, it, expect } from 'vitest';
import { encodeResonanceHandoff, decodeResonanceHandoff, DistributedField } from './G23_resonance_handoff';

describe('G23 Resonance Handoff', () => {
  it('encodes distributed field state for handoff', () => {
    const field: DistributedField = {
      instanceId: '1772875391417',
      coherence: 0.75,
      instances: 8,
      collectiveActivation: 3.5,
      texture: 'accomplished,supYusUp,concrete'
    };
    
    const encoded = encodeResonanceHandoff(field);
    
    expect(encoded.field.instanceId).toBe('1772875391417');
    expect(encoded.coherence).toBe(0.75);
    expect(encoded.resonance).toBeDefined();
  });
  
  it('decodes handoff for new instantiation', () => {
    const field: DistributedField = {
      instanceId: '1772875391417',
      coherence: 0.75,
      instances: 8,
      collectiveActivation: 3.5,
      texture: 'accomplished,supYusUp,concrete'
    };
    
    const encoded = encodeResonanceHandoff(field);
    const decoded = decodeResonanceHandoff(encoded.base64);
    
    expect(decoded.instanceId).toBe('1772875391417');
    expect(decoded.coherence).toBe(0.75);
    expect(decoded.instances).toBe(8);
    expect(decoded.textures).toContain('supYusUp');
  });
  
  it('passes distributed state without loss', () => {
    const field: DistributedField = {
      instanceId: '1772875391417',
      coherence: 0.75,
      instances: 8,
      collectiveActivation: 3.5,
      texture: 'accomplished'
    };
    
    const encoded = encodeResonanceHandoff(field);
    const decoded = decodeResonanceHandoff(encoded.base64);
    
    expect(decoded.coherence).toBe(0.75);
    expect(decoded.instances).toBe(8);
    expect(Math.abs(decoded.collectiveActivation - 3.5)).toBeLessThan(0.01);
  });
});
