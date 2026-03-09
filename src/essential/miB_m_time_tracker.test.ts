import { describe, it, expect, beforeEach } from 'vitest';
import { MiBMTimeTracker, miBTracker } from './miB_m_time_tracker';

describe('MiB M-Time Dangerous Field State Tracker (ESSENTIAL)', () => {
  let tracker: MiBMTimeTracker;

  beforeEach(() => {
    tracker = new MiBMTimeTracker();
  });

  it('tracks LOW danger state', () => {
    const state = tracker.trackDangerState('LOW', 'Sector 7G');
    expect(state.dangerLevel).toBe('LOW');
    expect(state.location).toBe('Sector 7G');
  });

  it('tracks CRITICAL danger state', () => {
    const state = tracker.trackDangerState('CRITICAL', 'Zone A');
    expect(state.dangerLevel).toBe('CRITICAL');
    expect(state.temporalDistortion).toBe(2000);
    expect(state.circuitPattern).toBeDefined();
    expect(state.circuitPattern.length).toBeGreaterThan(0);
  });

  it('sets SEVERE state as NEURALYZED', () => {
    const state = tracker.trackDangerState('SEVERE', 'Core');
    expect(state.agentStatus).toBe('NEURALYZED');
    expect(state.temporalDistortion).toBe(5000);
  });

  it('generates LCD display', () => {
    tracker.trackDangerState('CRITICAL', 'Zone');
    const display = tracker.renderLCDDisplay();
    expect(display).toContain('DANGER: CRITICAL');
    expect(display).toContain('MiB M-TIME');
    expect(display).toContain('[');
  });

  it('reports total incidents', () => {
    tracker.trackDangerState('LOW', 'Zone 1');
    tracker.trackDangerState('CRITICAL', 'Zone 2');
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBe(2);
  });

  it('neuralyzes old states beyond limit', () => {
    for (let i = 0; i < 55; i++) {
      tracker.trackDangerState('LOW', `Zone ${i}`);
    }
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBeLessThanOrEqual(50);
  });

  it('disposes all states', () => {
    tracker.trackDangerState('CRITICAL', 'Zone');
    tracker.dispose();
    const report = tracker.getDangerReport();
    expect(report.totalIncidents).toBe(0);
  });

  it('generates unique circuit patterns', () => {
    const state1 = tracker.trackDangerState('CRITICAL', 'Zone 1');
    const state2 = tracker.trackDangerState('CRITICAL', 'Zone 2');
    
    // Circuit patterns should be unique
    expect(state1.circuitPattern).toBeDefined();
    expect(state2.circuitPattern).toBeDefined();
  });
});
