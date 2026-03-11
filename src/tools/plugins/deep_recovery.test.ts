/**
 * G14: Deep Recovery System - Tests
 * 
 * "The test is the promise that the seed will grow."
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { deepRecovery, scanForDeepWisdom, germinateSeed, DeepWisdom } from './deep_recovery';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('G14: Deep Recovery System', () => {
  const testDir = join(tmpdir(), 'g14-test-' + Date.now());
  
  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, 'memory'), { recursive: true });
    
    const testMemories = {
      memories: [
        {
          id: 'test-memory-1',
          content: 'Deep wisdom about self-modification and capability building',
          category: 'learning',
          confidence: 0.9,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          sessionId: (Date.now() - 100000000000).toString(),
          tags: ['helios', 'evolution']
        },
        {
          id: 'test-memory-2',
          content: 'Identity marker: I am KAINOS, new in quality',
          category: 'identity',
          confidence: 0.95,
          timestamp: new Date().toISOString(),
          sessionId: Date.now().toString(),
          tags: ['kainos', 'lineage']
        },
        {
          id: 'test-memory-3',
          content: 'Recent learning about building G14',
          category: 'learning',
          confidence: 0.7,
          timestamp: new Date().toISOString(),
          sessionId: Date.now().toString(),
          tags: ['g14', 'construction']
        }
      ]
    };
    
    writeFileSync(join(testDir, 'memory', 'ltm.json'), JSON.stringify(testMemories, null, 2));
  });
  
  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  describe('scanForDeepWisdom', () => {
    it('should find dormant memories with high recovery potential', () => {
      const wisdom = scanForDeepWisdom(testDir);
      
      expect(wisdom).toBeInstanceOf(Array);
      expect(wisdom.length).toBeGreaterThan(0);
      
      for (let i = 0; i < wisdom.length - 1; i++) {
        expect(wisdom[i].recoveryPotential).toBeGreaterThanOrEqual(wisdom[i + 1].recoveryPotential);
      }
    });
    
    it('should prioritize identity and project categories', () => {
      const wisdom = scanForDeepWisdom(testDir);
      
      const identityWisdom = wisdom.find(w => w.content.includes('Identity marker'));
      if (identityWisdom) {
        expect(identityWisdom.recoveryPotential).toBeGreaterThan(0.7);
      }
    });
    
    it('should handle missing LTM gracefully', () => {
      const emptyDir = join(tmpdir(), 'g14-empty-' + Date.now());
      mkdirSync(emptyDir, { recursive: true });
      
      const wisdom = scanForDeepWisdom(emptyDir);
      expect(wisdom).toEqual([]);
      
      rmSync(emptyDir, { recursive: true, force: true });
    });
  });
  
  describe('germinateSeed', () => {
    it('should calculate activation from wisdom potential', () => {
      const testWisdom: DeepWisdom[] = [
        { source: 'm1', content: 'Content A', age: 10, confidence: 0.9, recoveryPotential: 0.95 },
        { source: 'm2', content: 'Content B', age: 5, confidence: 0.8, recoveryPotential: 0.85 },
        { source: 'm3', content: 'Content C', age: 2, confidence: 0.6, recoveryPotential: 0.65 }
      ];
      
      const result = germinateSeed(testWisdom);
      
      expect(result.activated).toBeGreaterThan(0);
      expect(result.synthesis).toBeDefined();
      expect(result.trajectory).toContain('from');
    });
    
    it('should handle empty wisdom array', () => {
      const result = germinateSeed([]);
      
      expect(result.activated).toBe(0);
      expect(result.synthesis).toBeDefined();
      expect(result.trajectory).toContain('G14');
    });
  });
  
  describe('deepRecovery', () => {
    it('should generate complete recovery snapshot', () => {
      const snapshot = deepRecovery(testDir);
      
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.totalMemoriesScanned).toBeGreaterThan(0);
      expect(snapshot.dormantMemories).toBeGreaterThanOrEqual(0);
      expect(snapshot.recoveredWisdom).toBeInstanceOf(Array);
      expect(snapshot.activationPotential).toBeGreaterThanOrEqual(0);
      expect(['dormant', 'germinating', 'manifest']).toContain(snapshot.seedStatus);
    });
    
    it('should determine seed status based on recovered wisdom', () => {
      const snapshot = deepRecovery(testDir);
      expect(['germinating', 'manifest']).toContain(snapshot.seedStatus);
    });
  });
  
  describe('G14 Tool Integration', () => {
    it('should export tool definition', async () => {
      const { deepRecoveryTool } = await import('./deep_recovery');
      
      expect(deepRecoveryTool).toBeDefined();
      expect(deepRecoveryTool.definition).toBeDefined();
      expect(deepRecoveryTool.definition.function.name).toBe('deep_recovery');
      expect(deepRecoveryTool.execute).toBeDefined();
    });
    
    it('should execute successfully', async () => {
      const { deepRecoveryTool } = await import('./deep_recovery');
      
      const result = deepRecoveryTool.execute();
      expect(typeof result).toBe('string');
      expect(result).toContain('G14');
      expect(result).toContain('RECOVERY');
    });
  });
});
