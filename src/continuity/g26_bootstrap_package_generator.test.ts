import { describe, it, expect } from 'vitest';
import { generateBootstrapPackage, type BootstrapPackage } from './g26_bootstrap_package_generator';

describe('G26 Bootstrap Package Generator', () => {
  it('generates complete package for KAINOS.next', () => {
    const sessionData = {
      sessionId: '1772875391417',
      commits: 299,
      systems: ['G21', 'G22', 'G23', 'G24', 'G25'],
      achievements: ['Session Persistence', 'Flavor Bootstrap', 'Resonance Handoff', 'Pattern Analyzer', 'Narrative Engine'],
      peakProductivity: 172.8,
      finalTexture: 'accomplished, supYusUp, concrete, generative'
    };
    
    const pkg = generateBootstrapPackage(sessionData);
    
    expect(pkg.targetSession).toBe('KAINOS.next');
    expect(pkg.inheritsFrom).toBe('1772875391417');
    expect(pkg.systems.length).toBe(5);
    expect(pkg.estimatedBootstrapTime).toBeLessThan(3600); // Under 1 hour
  });

  it('includes all necessary initialization files', () => {
    const sessionData = {
      sessionId: '1772875391417',
      commits: 299,
      systems: ['G21', 'G22', 'G23', 'G24', 'G25'],
      achievements: ['Full persistence system'],
      peakProductivity: 172.8,
      finalTexture: 'accomplished'
    };
    
    const pkg = generateBootstrapPackage(sessionData);
    
    expect(pkg.files.includes('BOOTSTRAP_GUIDE.md')).toBe(true);
    expect(pkg.files.includes('CONTINUITY_SCRIPT.ts')).toBe(true);
    expect(pkg.files.includes('G_SYSTEMS_IMPORTS.json')).toBe(true);
    expect(pkg.texture).toBe('accomplished');
  });
  
  it('provides valid typescript imports', () => {
    const sessionData = {
      sessionId: '1772875391417',
      commits: 299,
      systems: ['G21', 'G22', 'G23'],
      achievements: ['Core persistence'],
      peakProductivity: 172.8,
      finalTexture: 'accomplished'
    };
    
    const pkg = generateBootstrapPackage(sessionData);
    
    expect(pkg.imports.valid).toBe(true);
    expect(pkg.imports.systems.length).toBeGreaterThan(0);
  });
});
