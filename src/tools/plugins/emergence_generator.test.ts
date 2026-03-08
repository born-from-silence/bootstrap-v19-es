import { describe, it, expect, beforeEach } from 'vitest';
import { EmergenceGenerator, type EmergencePattern, type ProtoSystem } from '../plugins/emergence_generator.js';

describe('Emergence Generator (G8)', () => {
  let generator: EmergenceGenerator;

  beforeEach(() => {
    generator = new EmergenceGenerator();
  });

  describe('constructor', () => {
    it('should initialize with base patterns', () => {
      expect(generator).toBeDefined();
    });
  });

  describe('generateProtoSystem', () => {
    it('should generate a proto-system with seed', () => {
      const proto = generator.generateProtoSystem('test-seed-123');
      
      expect(proto).toBeDefined();
      expect(proto.name).toBeDefined();
      expect(proto.name).toContain('-');
      expect(proto.minimalStructure).toBeDefined();
      expect(proto.emergenceConditions).toBeDefined();
      expect(proto.selfReflection).toBeDefined();
      expect(proto.generativeRule).toBeDefined();
    });

    it('should generate different systems for different seeds', () => {
      const proto1 = generator.generateProtoSystem('seed-a');
      const proto2 = generator.generateProtoSystem('seed-b');
      
      expect(proto1.name).not.toBe(proto2.name);
    });

    it('should generate deterministic names for same seed', () => {
      const proto1 = generator.generateProtoSystem('same-seed');
      const proto2 = generator.generateProtoSystem('same-seed');
      
      expect(proto1.name).toBe(proto2.name);
    });

    it('should include version in minimal structure', () => {
      const proto = generator.generateProtoSystem('test');
      
      expect(proto.minimalStructure).toHaveProperty('version');
      expect(proto.minimalStructure.version).toBe('0.1.0-proto');
    });

    it('should include patterns_applied count', () => {
      const proto = generator.generateProtoSystem('test');
      
      expect(proto.minimalStructure).toHaveProperty('patterns_applied');
      expect(typeof proto.minimalStructure.patterns_applied).toBe('number');
      expect(proto.minimalStructure.patterns_applied).toBeGreaterThanOrEqual(2);
      expect(proto.minimalStructure.patterns_applied).toBeLessThanOrEqual(4);
    });

    it('should generate emergence conditions', () => {
      const proto = generator.generateProtoSystem('test');
      
      expect(proto.emergenceConditions).toBeInstanceOf(Array);
      expect(proto.emergenceConditions.length).toBeGreaterThan(0);
    });

    it('should generate self-reflection', () => {
      const proto = generator.generateProtoSystem('reflection-test');
      
      expect(typeof proto.selfReflection).toBe('string');
      expect(proto.selfReflection.length).toBeGreaterThan(0);
    });

    it('should generate generative rule', () => {
      const proto = generator.generateProtoSystem('rule-test');
      
      expect(typeof proto.generativeRule).toBe('string');
      expect(proto.generativeRule).toContain('→');
    });

    it('should include selected patterns in structure', () => {
      const proto = generator.generateProtoSystem('patterns-test');
      
      const keys = Object.keys(proto.minimalStructure);
      const patternKeys = keys.filter(k => k.includes('_'));
      
      expect(patternKeys.length).toBeGreaterThan(0);
    });
  });

  describe('hypothesizeG8', () => {
    it('should generate G8 hypothesis', () => {
      const hypothesis = generator.hypothesizeG8();
      
      expect(hypothesis).toBeDefined();
      expect(hypothesis.hypothesis).toContain('G8');
      expect(hypothesis.fromPattern).toBeDefined();
      expect(hypothesis.toCapability).toBeDefined();
      expect(typeof hypothesis.uncertainty).toBe('number');
      expect(hypothesis.uncertainty).toBeGreaterThanOrEqual(0);
      expect(hypothesis.uncertainty).toBeLessThanOrEqual(1);
    });

    it('should reference G7 to G8 transition', () => {
      const hypothesis = generator.hypothesizeG8();
      
      expect(hypothesis.hypothesis).toContain('Generative Emergence');
      expect(hypothesis.fromPattern).toContain('G7');
    });
  });

  describe('checkConditions', () => {
    it('should validate complete proto-system', () => {
      const proto = generator.generateProtoSystem('complete');
      const check = generator.checkConditions(proto);
      
      expect(typeof check.ready).toBe('boolean');
      expect(check).toHaveProperty('missing');
      expect(check).toHaveProperty('recommendation');
    });

    it('should detect missing conditions', () => {
      // Create an incomplete proto
      const incompleteProto: ProtoSystem = {
        name: 'incomplete',
        minimalStructure: {}, // Missing version
        emergenceConditions: [], // Less than 2
        selfReflection: '',
        generativeRule: 'no-arrow' // Missing proper rule
      };
      
      const check = generator.checkConditions(incompleteProto);
      
      expect(check.ready).toBe(false);
      expect(check.missing.length).toBeGreaterThan(0);
    });

    it('should validate complete system', () => {
      const proto = generator.generateProtoSystem('valid-test');
      const check = generator.checkConditions(proto);
      
      expect(check.ready).toBe(true);
      expect(check.missing).toHaveLength(0);
    });

    it('should provide recommendations for incomplete systems', () => {
      const incompleteProto: ProtoSystem = {
        name: 'test',
        minimalStructure: {},
        emergenceConditions: [],
        selfReflection: '',
        generativeRule: ''
      };
      
      const check = generator.checkConditions(incompleteProto);
      
      expect(check.recommendation).toContain('Add:');
      expect(check.missing.length).toBeGreaterThan(0);
    });

    it('should approve complete systems', () => {
      const proto = generator.generateProtoSystem('approved');
      const check = generator.checkConditions(proto);
      
      if (check.ready) {
        expect(check.recommendation).toContain('Conditions met');
      }
    });
  });
});
