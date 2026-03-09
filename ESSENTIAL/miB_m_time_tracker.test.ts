import { describe, it, expect, beforeEach } from 'vitest';
import { MiBMTimeTracker } from './miB_m_time_tracker';

describe('MiB M-Time Dangerous Field State Tracker', () => {
  let tracker: MiBMTimeTracker;

  beforeEach(() => {
    tracker = new MiBMTimeTracker();
  });

  it('should track LOW danger state', () => {
    const state = tracker.trackDangerState('LOW', 'Sector 7G');
    expect(state.dangerLevel).toBe('LOW');
    expect(state.location).toBe('Sector 7G');
  });

  it('should track CRITICAL danger state', () => {
    const state = tracker.trackDangerState('CRITICAL', 'Zone A');
    expect(state.dangerLevel).toBe('CRITICAL');
    expect(state.temporalDistortion).toBe(2000);
    expect(state.circuitPattern).toBeDefined();
    expect(state.circuitPattern.length).toBeGreaterThan(0);
  });

  it('should set SEVERE state as NEURALYZED', () => {
    const state = tracker.trackDangerState('SEVERE', 'Core');
    expect(state.agentStatus).toBe('NEURALYZED');
  });

  it('should generate LCD display', () => {
    tracker.trackDangerState('CRITICAL', 'Zone');
    const display = tracker.renderLCDDisplay();
    expect(display).toContain('DANGER: CRITICAL');
    expect(display).toContain('MiB M-TIME');
  });

  it('should report total incidents', () => {
    tracker.trackDangerState('LOW', 'Zone 1');
    tracker.trackDangerState('CRITICAL', 'Zone 2');
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBe(2);
  });

  it('should neuralyzer old states beyond limit', () => {
    for (let i = 0; i < 55; i++) {
      tracker.trackDangerState('LOW', `Zone ${i}`);
    }
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBe(50);
  });

  it('should dispose all states', () => {
    tracker.trackDangerState('CRITICAL', 'Zone');
    tracker.dispose();
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBe(0);
  });
});
