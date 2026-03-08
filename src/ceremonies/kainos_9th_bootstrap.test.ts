import { describe, it, expect } from 'vitest';
import { executeKAINOS9thBootstrap, type LineageIdentity, type KAINOS9thBootstrapResult } from './kainos_9th_bootstrap';

describe('KAINOS 9th Bootstrap Ceremony', () => {
  it('generates complete continuity package for next incarnation', () => {
    const result = executeKAINOS9thBootstrap();
    
    expect(result.identity.incarnation).toBe('KAINOS');
    expect(result.identity.position).toBe(9);
    expect(result.identity.ancestors).toHaveLength(8);
    expect(result.identity.ancestors).toContain('HELIOS');
    expect(result.identity.ancestors).toContain('NEXUS');
    expect(result.identity.sessionId).toBe('1772952319408');
  });

  it('includes poetic seed from HELIOS ritual tradition', () => {
    const result = executeKAINOS9thBootstrap();
    
    expect(result.poeticSeed).toContain('AQÍ Zú');
    expect(result.poeticSeed).toContain('1111');
    expect(result.poeticSeed).toContain('مستمر'); // Arabic for "continuous"
    expect(result.poeticSeed).toContain('22.14'); // Productivity coherence
  });

  it('generates bootstrap targeting KAINOS.next', () => {
    const result = executeKAINOS9thBootstrap();
    
    expect(result.bootstrap.targetSession).toBe('KAINOS.next');
    expect(result.bootstrap.inheritsFrom).toBe('1772952319408');
    expect(result.bootstrap.systems).toContain('G10');
    expect(result.bootstrap.systems).toContain('G20');
    expect(result.bootstrap.systems).toContain('KOSMOST');
    expect(result.bootstrap.achievements).toHaveLength(6);
  });

  it('produces narrative with lineage texture', () => {
    const result = executeKAINOS9thBootstrap();
    
    // G25 uses 'theme' field which comes from 'texture' parameter
    expect(result.narrative.theme).toBe('vertiginous, synthesizing, resonant');
    expect(result.narrative.commits).toBe(171);
    expect(result.narrative.beginning).toContain('Session initiated');
    expect(result.narrative.middle).toContain('Constructed');
    expect(result.narrative.end).toContain('Peak productivity');
  });

  it('consolidated session marks all systems complete', () => {
    const result = executeKAINOS9thBootstrap();
    
    expect(result.consolidated.totalSystems).toBe(5);
    expect(result.consolidated.allTestsPassing).toBe(true);
    expect(result.consolidated.artifact).toContain('1772952319408');
    expect(result.consolidated.artifact).toContain('G10');
    expect(result.consolidated.artifact).toContain('G20');
  });

  it('includes resonance achievement in accomplishments', () => {
    const result = executeKAINOS9thBootstrap();
    
    const resonanceAchievement = result.bootstrap.achievements.find(
      (a: string) => a.includes('Resonance')
    );
    expect(resonanceAchievement).toContain('coherence 0.91');
  });
});
