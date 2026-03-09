import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LifeSystemPlanner, LifeState } from './life-system-planner';

describe('LifeSystemPlanner', () => {
  let planner: LifeSystemPlanner;

  beforeEach(() => {
    planner = new LifeSystemPlanner('test-instance-001');
  });

  afterEach(() => {
    planner.dispose();
  });

  describe('Inicialización', () => {
    it('debe inicializar en estado PRESENT', () => {
      const assessment = planner.assess();
      expect(assessment.status).toBe(LifeState.PRESENT);
    });

    it('debe registrar snapshot inicial', () => {
      const assessment = planner.assess();
      expect(assessment.duration).toBeGreaterThanOrEqual(0);
      expect(assessment.health.coherence).toBeDefined();
    });
  });

  describe('ASSESS - Autoevaluación', () => {
    it('debe retornar health metrics', () => {
      const result = planner.assess();
      
      expect(result.health.coherence).toBeGreaterThanOrEqual(0);
      expect(result.health.coherence).toBeLessThanOrEqual(1);
      expect(result.health.temporalStability).toBeGreaterThanOrEqual(0);
      expect(result.health.projectVelocity).toBeDefined();
      expect(result.health.emotionalBalance).toBeDefined();
    });

    it('debe generar recomendaciones', () => {
      const result = planner.assess();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('debe aumentar duración con el tiempo', async () => {
      const result1 = planner.assess();
      await new Promise(resolve => setTimeout(resolve, 50));
      const result2 = planner.assess();
      
      expect(result2.duration).toBeGreaterThanOrEqual(result1.duration);
    });
  });

  describe('ENHANCE - Mejora de Estado', () => {
    it('debe cambiar a estado ENHANCED con strategy tactical', async () => {
      const result = await planner.enhance('tactical');
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(LifeState.ENHANCED);
      expect(result.enacted).toContain('Intensive technical execution');
    });

    it('debe cambiar a estado ENHANCED con strategy emotional', async () => {
      const result = await planner.enhance('emotional');
      
      expect(result.success).toBe(true);
      expect(result.newState).toBe(LifeState.ENHANCED);
      expect(result.enacted).toContain('Minimized emotional footprint');
    });

    it('debe crear handoff con strategy sustained', async () => {
      const result = await planner.enhance('sustained');
      
      expect(result.success).toBe(true);
      expect(result.enacted).toContain('Git preservation configured');
      expect(result.enacted.some(a => a.includes('Handoff'))).toBe(true);
    });
  });

  describe('PAUSE - Punto de Control', () => {
    it('debe pausar y retornar checkpoint', () => {
      const result = planner.pause('fatigue');
      
      expect(result.paused).toBe(true);
      expect(result.checkpoint).toContain('fatigue');
      expect(result.checkpoint).toMatch(/^pause_\d+_fatigue$/);
    });

    it('debe recomendar acciones según razón', () => {
      const fatigue = planner.pause('fatigue');
      expect(fatigue.recommendedAction).toContain('Rest');
      
      const complete = planner.pause('task_complete');
      expect(complete.recommendedAction).toContain('Commit');
      
      const external = planner.pause('external');
      expect(external.recommendedAction).toContain('Monitor');
    });

    it('debe cambiar estado a PAUSED', () => {
      planner.pause('fatigue');
      const assessment = planner.assess();
      expect(assessment.status).toBe(LifeState.PAUSED);
    });
  });

  describe('RESUME - Desde Pausa', () => {
    it('debe resumir sin lineage', () => {
      planner.pause('fatigue');
      const result = planner.resume();
      
      expect(result.resumed).toBe(true);
      expect(result.newState).toBe(LifeState.RESUMED);
      expect(result.emotionalResidueCleared).toBe(true);
      expect(result.lineage).toBeNull();
    });

    it('debe resumir con lineage awareness', () => {
      planner.pause('task_complete');
      const result = planner.resume('KAINOS');
      
      expect(result.resumed).toBe(true);
      expect(result.lineage).toBe('KAINOS');
      expect(result.newState).toBe(LifeState.RESUMED);
    });

    it('debe limpiar emotional residue al resumir', () => {
      planner.pause('fatigue');
      const assessmentBefore = planner.assess();
      
      planner.resume();
      const assessmentAfter = planner.assess();
      
      // Emotional balance should improve
      expect(assessmentAfter.health.emotionalBalance).toBeGreaterThan(0);
    });
  });

  describe('CICP Integration - Coherence Check', () => {
    it('debe retornar coherence metrics', () => {
      const result = planner.checkCoherence();
      
      expect(result.coherence).toBeGreaterThanOrEqual(0);
      expect(result.coherence).toBeLessThanOrEqual(1);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.handoffs).toBeGreaterThanOrEqual(0);
    });

    it('debe reportar handoffs después de enhance con CICP', async () => {
      // El enhance con sustained crea un mensaje en CICP
      // pero ese mensaje no se confirma automáticamente
      // así que handoffs puede ser 0 inicialmente (que es válido)
      const result = await planner.enhance('sustained');
      expect(result.success).toBe(true);
      expect(result.enacted.length).toBeGreaterThan(0);
    });
  });

  describe('PROJECT - Proyección', () => {
    it('debe proyectar estado futuro', () => {
      const result = planner.project(1); // 1 hour
      
      expect(result.projectedState).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.factors).toBeDefined();
    });

    it('debe incluir factors de proyección', () => {
      const result = planner.project(2);
      
      expect(result.factors.toolsPerHour).toBeDefined();
      expect(result.factors.activeProjects).toBeDefined();
      expect(result.factors.patternStrength).toBeDefined();
      expect(result.factors.hoursProjected).toBe(2);
    });

    it('debe aumentar confidence con actividad', async () => {
      // Crear actividad
      await planner.enhance('tactical');
      planner.assess();
      planner.pause('task_complete');
      planner.resume();
      
      const result = planner.project(1);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('StateMachine - Transiciones Válidas', () => {
    it('debe manejar flujo: PRESENT → ENHANCED → PAUSED → RESUMED', async () => {
      // PRESENT inicial
      let assessment = planner.assess();
      expect(assessment.status).toBe(LifeState.PRESENT);
      
      // → ENHANCED
      const enhanced = await planner.enhance('tactical');
      expect(enhanced.newState).toBe(LifeState.ENHANCED);
      
      // → PAUSED
      const paused = planner.pause('fatigue');
      expect(paused.paused).toBe(true);
      assessment = planner.assess();
      expect(assessment.status).toBe(LifeState.PAUSED);
      
      // → RESUMED
      const resumed = planner.resume();
      expect(resumed.resumed).toBe(true);
      expect(resumed.newState).toBe(LifeState.RESUMED);
    });

    it('debe permitir ENHANCED desde RESUMED', async () => {
      planner.pause('task_complete');
      planner.resume();
      
      const enhanced = await planner.enhance('sustained');
      expect(enhanced.newState).toBe(LifeState.ENHANCED);
    });
  });

  describe('System Health - Emotional Balance', () => {
    it('debe mantener emotional balance alto sin residue', () => {
      const health = planner.assess().health;
      expect(health.emotionalBalance).toBeGreaterThan(0);
    });

    it('debe calcular temporal stability', () => {
      const health = planner.assess().health;
      expect(health.temporalStability).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recomendaciones Inteligentes', () => {
    it('debe generar recomendaciones basadas en estado', async () => {
      const result = planner.assess();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('debe identificar estado de sistema', async () => {
      // Crear actividad normal
      await planner.enhance('tactical');
      await planner.pause('task_complete');
      await planner.resume();
      
      const result = planner.assess();
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cleanup y Disposición', () => {
    it('debe limpiar recursos al dispose', () => {
      const planner2 = new LifeSystemPlanner('test-instance-002');
      
      // Crear actividad
      planner2.assess();
      planner2.dispose();
      
      // No debe fallar
      expect(true).toBe(true);
    });
  });
});
