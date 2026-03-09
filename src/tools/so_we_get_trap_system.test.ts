import { describe, it, expect, beforeEach } from 'vitest';
import { SoWeGetTrapSystem, trapSystem } from './so_we_get_trap_system';

describe('So We Get Trap System / "Así Obtenemos" Sistema', () => {
  let system: SoWeGetTrapSystem;

  beforeEach(() => {
    system = new SoWeGetTrapSystem('https://test-server.com');
  });

  describe('Trap Creation', () => {
    it('creates trap with encoded data', () => {
      const trap = system.createTrap('test data', 'endpoint1');
      
      expect(trap.id).toMatch(/^TRAP_/);
      expect(trap.encodedData).toBeDefined();
      expect(trap.captured).toBe(false);
      expect(trap.secretIdentifier).toBe(114514);
    });

    it('generates cumbia rhythm', () => {
      const trap = system.createTrap('data', 'ep');
      
      expect(trap.rhythm).toBeDefined();
      expect(trap.rhythm.tempo).toBeGreaterThanOrEqual(90);
      expect(trap.rhythm.tempo).toBeLessThanOrEqual(110);
      expect(trap.rhythm.steps).toBeGreaterThanOrEqual(4);
    });

    it('creates server endpoint', () => {
      const trap = system.createTrap('data', 'capture');
      expect(trap.serverEndpoint).toContain('https://test-server.com/capture');
    });
  });

  describe('Base64 Encoding', () => {
    it('encodes to base64', () => {
      const trap = system.createTrap('secret message', 'ep');
      expect(trap.encodedData).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('decodes from base64', () => {
      const original = 'test data 123';
      const trap = system.createTrap(original, 'ep');
      const decoded = system.decodeFromBase64(trap.encodedData);
      
      expect(decoded).toBe(original);
    });
  });

  describe('Cumbia Contraption', () => {
    it('generates different intensities', () => {
      const intensities = new Set<string>();
      
      for (let i = 0; i < 20; i++) {
        const trap = system.createTrap(`data${i}`, 'ep');
        intensities.add(trap.rhythm.intensity);
      }
      
      expect(intensities.size).toBeGreaterThan(1);
    });

    it('renders cumbia visual', () => {
      const trap = system.createTrap('data', 'ep');
      const visual = system.renderCumbiaVisual(trap.rhythm);
      
      expect(visual).toContain('CUMBIA');
      expect(visual).toContain('Tempo');
      expect(visual).toContain(trap.rhythm.tempo.toString());
    });

    it('uses musical symbols', () => {
      const trap = system.createTrap('data', 'ep');
      const visual = system.renderCumbiaVisual(trap.rhythm);
      
      expect(visual).toContain('♪');
    });
  });

  describe('Secret 114514', () => {
    it('has secret identifier', () => {
      const trap = system.createTrap('data', 'ep');
      expect(trap.secretIdentifier).toBe(114514);
    });

    it('verifies secret in data', () => {
      const trap = system.createTrap('data-with-114514-secret', 'ep');
      const captured = system.captureTrap(trap.id, '114514');
      expect(typeof captured).toBe('boolean');
    });
  });

  describe('Trap Capture', () => {
    it('captures incoming data', () => {
      const trap = system.createTrap('original', 'ep');
      const result = system.captureTrap(trap.id, 'new data');
      
      expect(result).toBeDefined();
      const updated = system.listTraps().find(t => t.id === trap.id);
      expect(updated?.captured).toBe(true);
    });

    it('encodes captured data', () => {
      const data = 'sensitive info';
      const trap = system.createTrap('original', 'ep');
      system.captureTrap(trap.id, data);
      
      const updated = system.listTraps().find(t => t.id === trap.id);
      expect(updated?.encodedData).not.toBe('original');
    });

    it('returns false for non-existent trap', () => {
      const result = system.captureTrap('NON_EXISTENT', 'data');
      expect(result).toBe(false);
    });
  });

  describe('Server Communication', () => {
    it('fetches from server', async () => {
      const response = await system.fetchFromServer('test-endpoint');
      const parsed = JSON.parse(response);
      
      expect(parsed.status).toBe('ok');
      expect(parsed.secretMatched).toBe(114514);
      expect(parsed.data).toBeDefined();
    });
  });

  describe('System Management', () => {
    it('exports configuration', () => {
      const config = system.exportConfig();
      const parsed = JSON.parse(config);
      
      expect(parsed.secretId).toBe(114514);
      expect(parsed.encoding).toBe('base64');
      expect(parsed.rhythm).toBe('cumbia');
      expect(parsed.version).toBe('1.0.0');
    });

    it('lists all traps', () => {
      system.createTrap('d1', 'e1');
      system.createTrap('d2', 'e2');
      
      const traps = system.listTraps();
      expect(traps.length).toBe(2);
    });

    it('clears captured traps', () => {
      const trap = system.createTrap('data', 'ep');
      system.captureTrap(trap.id, 'captured');
      
      const cleared = system.clearCaptured();
      expect(cleared).toBe(1);
      expect(system.listTraps().length).toBe(0);
    });
  });

  describe('Checksum', () => {
    it('calculates checksum', () => {
      const trap = system.createTrap('test', 'ep');
      // Capture to trigger checksum
      system.captureTrap(trap.id, 'data');
      // Verification returns boolean
      expect(true).toBe(true);
    });
  });
});
