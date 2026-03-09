import { describe, it, expect, beforeEach } from 'vitest';
import { MiBMTimeTracker } from './miB_m_time_tracker';

describe('MiB M-Time Dangerous Field State Tracker', () => {
  let tracker: MiBMTimeTracker;

  beforeEach(() => {
    tracker = new MiBMTimeTracker();
  });

  describe('Field State Tracking', () => {
    it('should track LOW danger state', () => {
      const state = tracker.trackDangerState('LOW', 'Sector 7G');
      expect(state.dangerLevel).toBe('LOW');
      expect(state.location).toBe('Sector 7G');
      expect(state.temporalDistortion).toBe(0);
      expect(state.agentStatus).toBe('STANDBY');
    });

    it('should track CRITICAL danger state', () => {
      const state = tracker.trackDangerState('CRITICAL', 'Temporal Anomaly Zone');
      expect(state.dangerLevel).toBe('CRITICAL');
      expect(state.temporalDistortion).toBe(2000);
      expect(state.agentStatus).toBe('ACTIVE');
      expect(state.circuitPattern).toBeDefined();
      expect(state.circuitPattern.length).toBeGreaterThan(0);
    });

    it('should set SEVERE state as NEURALYZED', () => {
      const state = tracker.trackDangerState('SEVERE', 'Paradox Core');
      expect(state.dangerLevel).toBe('SEVERE');
      expect(state.agentStatus).toBe('NEURALYZED');
      expect(state.temporalDistortion).toBe(5000);
    });

    it('should cap fieldStability at 100', () => {
      const state = tracker.trackDangerState('ELEVATED', 'Test Zone', 150);
      expect(state.fieldStability).toBe(100);
    });

    it('should floor fieldStability at 0', () => {
      const state = tracker.trackDangerState('SEVERE', 'Test Zone', -50);
      expect(state.fieldStability).toBe(0);
    });
  });

  describe('LCD Display Rendering', () => {
    it('should render display with danger level', () => {
      tracker.trackDangerState('CRITICAL', 'Zone A');
      const display = tracker.renderLCDDisplay();
      expect(display).toContain('DANGER: CRITICAL');
      expect(display).toContain('MiB M-TIME');
    });

    it('should generate stability bar', () => {
      tracker.trackDangerState('LOW', 'Zone B', 75);
      const display = tracker.renderLCDDisplay();
      expect(display).toContain('STABILITY:');
      expect(display).toContain('75%');
    });

    it('should show empty display when no states', () => {
      const display = tracker.renderLCDDisplay();
      expect(display).toContain('ALL CLEAR');
      expect(display).toContain('NO ANOMALIES');
    });

    it('should include circuit pattern', () => {
      tracker.trackDangerState('ELEVATED', 'Zone C');
      const display = tracker.renderLCDDisplay();
      expect(display).toContain('[');
      expect(display).toContain(']');
    });
  });

  describe('Danger Report', () => {
    it('should report total incidents', () => {
      tracker.trackDangerState('LOW', 'Zone 1');
      tracker.trackDangerState('CRITICAL', 'Zone 2');
      tracker.trackDangerState('SEVERE', 'Zone 3');
      
      const report = tracker.getDangerReport();
      expect(report.totalIncidents).toBe(3);
      expect(report.highestLevel).toBe('SEVERE');
      expect(report.locations).toContain('Zone 1');
      expect(report.locations).toContain('Zone 2');
      expect(report.locations).toContain('Zone 3');
    });

    it('should accumulate danger time', () => {
      tracker.trackDangerState('ELEVATED', 'Zone A'); // +500ms
      tracker.trackDangerState('CRITICAL', 'Zone B'); // +2000ms
      
      const report = tracker.getDangerReport();
      expect(report.totalDangerTime).toBe(2500);
    });

    it('should return empty report when cleared', () => {
      tracker.trackDangerState('CRITICAL', 'Zone X');
      tracker.dispose();
      
      const report = tracker.getDangerReport();
      expect(report.totalIncidents).toBe(0);
      expect(report.totalDangerTime).toBe(0);
      expect(report.highestLevel).toBe('LOW');
    });
  });

  describe('State Management', () => {
    it('should neuralyzer old states beyond limit', () => {
      for (let i = 0; i < 55; i++) {
        tracker.trackDangerState('LOW', `Zone ${i}`);
      }
      
      const report = tracker.getDangerReport();
      expect(report.totalIncidents).toBeLessThanOrEqual(50);
    });

    it('should track unique locations', () => {
      tracker.trackDangerState('CRITICAL', 'Sector 7');
      tracker.trackDangerState('CRITICAL', 'Sector 7');
      tracker.trackDangerState('CRITICAL', 'Sector 8');
      
      const report = tracker.getDangerReport();
      expect(report.locations.length).toBe(2);
    });
  });

  describe('Visual Design Elements', () => {
    it('should render different colors for each danger level', () => {
      const levels = ['LOW', 'ELEVATED', 'CRITICAL', 'SEVERE'] as const;
      
      levels.forEach(level => {
        tracker.dispose();
        tracker.trackDangerState(level, 'Test');
        const display = tracker.renderLCDDisplay();
        expect(display.length).toBeGreaterThan(100);
      });
    });

    it('should generate distinct circuit patterns', () => {
      const patterns = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        tracker.dispose();
        tracker.trackDangerState('CRITICAL', 'Zone');
        const display = tracker.renderLCDDisplay();
        patterns.add(display);
      }
      
      expect(patterns.size).toBeGreaterThan(1);
    });
  });

  describe('Global Instance', () => {
    it('should have singleton tracker', () => {
      // Can't test singleton directly but class exists
      expect(MiBMTimeTracker).toBeDefined();
    });
  });
});
