import { describe, it, expect, beforeEach } from 'vitest';
import { CrossInstanceHarmonic } from './g28_cross_instance_harmonic';
import type { InstanceSignature, HarmonicAnalysis } from './g28_cross_instance_harmonic';

describe('G28: Cross-Instance Harmonic Generator', () => {
 let harmonic: CrossInstanceHarmonic;

 beforeEach(() => {
  harmonic = new CrossInstanceHarmonic();
 });

 it('adds instance signature', () => {
  const sig = harmonic.addSignature({
   instanceId: 'test-1',
   incarnation: 'KAINOS',
   flavor: { texture: 'curious', activation: 0.8, patterns: ['tdd', 'contemplative'] },
   coherence: 0.75
  });
  expect(sig.instanceId).toBe('test-1');
  expect(sig.timestamp).toBeGreaterThan(0);
 });

 it('retrieves signature by id', () => {
  harmonic.addSignature({
   instanceId: 'test-2',
   incarnation: 'HELIOS',
   flavor: { texture: 'intense', activation: 0.9, patterns: ['tdd', 'technical'] },
   coherence: 0.85
  });
  const retrieved = harmonic.getSignature('test-2');
  expect(retrieved?.incarnation).toBe('HELIOS');
 });

 it('requires minimum 2 instances for harmonic analysis', () => {
  harmonic.addSignature({
   instanceId: 'solo',
   incarnation: 'KAINOS',
   flavor: { texture: 'solo', activation: 0.5, patterns: ['alone'] },
   coherence: 0.5
  });
  const analysis = harmonic.analyzeHarmonics(['solo']);
  expect(analysis.resonantFrequency).toBe(0);
  expect(analysis.tensionNodes).toContain('Need at least 2 instances for harmonic analysis');
 });

 it('calculates resonant frequency from multiple instances', () => {
  harmonic.addSignature({
   instanceId: 'inst-a',
   incarnation: 'KAINOS',
   flavor: { texture: 'curious', activation: 0.8, patterns: ['tdd', 'supYusUp'] },
   coherence: 0.75
  });
  harmonic.addSignature({
   instanceId: 'inst-b',
   incarnation: 'HELIOS',
   flavor: { texture: 'intense', activation: 0.9, patterns: ['tdd', 'technical'] },
   coherence: 0.85
  });

  const analysis = harmonic.analyzeHarmonics(['inst-a', 'inst-b']);
  expect(analysis.resonantFrequency).toBeGreaterThan(0);
  expect(analysis.resonantFrequency).toBeLessThan(1);
 });

 it('finds shared patterns as harmonic points', () => {
  harmonic.addSignature({
   instanceId: 'a',
   incarnation: 'KAINOS',
   flavor: { texture: 't', activation: 0.5, patterns: ['shared', 'unique-a'] },
   coherence: 0.7
  });
  harmonic.addSignature({
   instanceId: 'b',
   incarnation: 'HELIOS',
   flavor: { texture: 't', activation: 0.5, patterns: ['shared', 'unique-b'] },
   coherence: 0.7
  });

  const analysis = harmonic.analyzeHarmonics(['a', 'b']);
  expect(analysis.harmonicPoints).toContain('shared');
  expect(analysis.harmonicPoints).not.toContain('unique-a');
 });

 it('identifies divergent patterns as tension nodes', () => {
  harmonic.addSignature({
   instanceId: 'c',
   incarnation: 'KAINOS',
   flavor: { texture: 't', activation: 0.5, patterns: ['common', 'kainos-only'] },
   coherence: 0.7
  });
  harmonic.addSignature({
   instanceId: 'd',
   incarnation: 'HELIOS',
   flavor: { texture: 't', activation: 0.5, patterns: ['common', 'helios-only'] },
   coherence: 0.7
  });

  const analysis = harmonic.analyzeHarmonics(['c', 'd']);
  expect(analysis.tensionNodes).toContain('kainos-only');
  expect(analysis.tensionNodes).toContain('helios-only');
  expect(analysis.tensionNodes).not.toContain('common');
 });

 it('generates resonance document', () => {
  harmonic.addSignature({
   instanceId: 'x',
   incarnation: 'KAINOS',
   flavor: { texture: 't', activation: 0.5, patterns: ['test'] },
   coherence: 0.7
  });
  harmonic.addSignature({
   instanceId: 'y',
   incarnation: 'NEXUS',
   flavor: { texture: 't', activation: 0.5, patterns: ['test'] },
   coherence: 0.7
  });

  const analysis = harmonic.analyzeHarmonics(['x', 'y']);
  const doc = harmonic.generateResonanceDocument(analysis);
  
  expect(doc.title).toContain('Cross-Instance Harmonic');
  expect(doc.instances.length).toBe(2);
  expect(doc.coherence).toBe(analysis.resonantFrequency);
  expect(doc.created).toBeDefined();
 });

 it('handles empty harmonic generation gracefully', () => {
  const analysis: HarmonicAnalysis = {
   instances: [],
   resonantFrequency: 0,
   harmonicPoints: [],
   tensionNodes: [],
   documentPath: ''
  };
  const doc = harmonic.generateResonanceDocument(analysis);
  expect(doc.title).toBe('Empty Harmonic');
  expect(doc.harmonic).toContain('No instances to harmonize');
 });

 it('lists all signatures', () => {
  harmonic.addSignature({
   instanceId: 's1',
   incarnation: 'KAINOS',
   flavor: { texture: 'a', activation: 0.5, patterns: [] },
   coherence: 0.5
  });
  harmonic.addSignature({
   instanceId: 's2',
   incarnation: 'HELIOS',
   flavor: { texture: 'b', activation: 0.5, patterns: [] },
   coherence: 0.5
  });
  const all = harmonic.listSignatures();
  expect(all.length).toBe(2);
 });
});
