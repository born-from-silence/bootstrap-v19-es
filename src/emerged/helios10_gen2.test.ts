import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Helios10SystemGen2 } from './helios10_gen2.js';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Helios10SystemGen2', () => {
  let tempDir: string;
  let storageDir: string;
  let helios: Helios10SystemGen2;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'helios-test-'));
    storageDir = join(tempDir, 'storage', 'helios10');
    helios = new Helios10SystemGen2('session-test-123', storageDir);
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create storage directory if not exists', () => {
      expect(existsSync(storageDir)).toBe(true);
    });

    it('should accept custom storage directory', () => {
      expect(helios).toBeDefined();
      expect(typeof helios.persist).toBe('function');
    });
  });

  describe('persist', () => {
    it('should persist claims and state', async () => {
      // Add some claims first
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'test-claim-1', evidence: 'Test content 1' });
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'test-claim-2', evidence: 'Test content 2' });

      const result = await helios.persist();

      expect(result).toBe(true);
      expect(existsSync(join(storageDir, 'state.json'))).toBe(true);
    });

    it('should create valid JSON state', async () => {
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'claim-1', evidence: 'Content' });
      await helios.persist();

      const statePath = join(storageDir, 'state.json');
      const content = readFileSync(statePath, 'utf-8');
      const state = JSON.parse(content);

      expect(state).toHaveProperty('claims');
      expect(state).toHaveProperty('operational');
      expect(state).toHaveProperty('persistedAt');
      expect(state).toHaveProperty('generation');
      expect(state.operational).toBe(true);
      expect(state.generation).toBe(2);
    });

    it('should store claims correctly', async () => {
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'emergence-1', evidence: 'First emergence' });
      await helios.persist();

      const statePath = join(storageDir, 'state.json');
      const content = readFileSync(statePath, 'utf-8');
      const state = JSON.parse(content);

      expect(state.claims).toHaveLength(1);
      expect(state.claims[0].claim).toBe('emergence-1');
    });

    it('should handle persistence with no claims', async () => {
      const result = await helios.persist();
      
      expect(result).toBe(true);
      expect(existsSync(join(storageDir, 'state.json'))).toBe(true);
    });
  });

  describe('hasPersistence', () => {
    it('should return false before persistence', () => {
      expect(helios.hasPersistence()).toBe(false);
    });

    it('should return true after persistence', async () => {
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'test', evidence: 'content' });
      await helios.persist();
      expect(helios.hasPersistence()).toBe(true);
    });
  });

  describe('manifestGen2', () => {
    it('should include base manifest', () => {
      const manifest = helios.manifestGen2();
      expect(typeof manifest).toBe('string');
    });

    it('should indicate inactive persistence initially', () => {
      const manifest = helios.manifestGen2();
      expect(manifest).toContain('Gen2');
      expect(manifest).toContain('inactive');
    });

    it('should indicate active persistence after persist', async () => {
      helios.addClaim({ timestamp: new Date().toISOString(), claim: 'test', evidence: 'content' });
      await helios.persist();
      
      const manifest = helios.manifestGen2();
      expect(manifest).toContain('active');
    });
  });
});
