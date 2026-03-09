import { describe, it, expect, beforeEach } from 'vitest';
import { WastingDaysTracker, wastingDays } from './wasting_days_tracker';

describe('Wasting Days Tracker / 浪费天数追踪器', () => {
  let tracker: WastingDaysTracker;

  beforeEach(() => {
    tracker = new WastingDaysTracker();
    tracker.dispose();
  });

  it('should capture wasted day with waiting reason', async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    const day = tracker.captureWastedDay('waiting', 'SESSION_001', 'PART_M_01');
    
    expect(day.reason).toBe('waiting');
    expect(day.sessionId).toBe('SESSION_001');
    expect(day.partDesignation).toBe('PART_M_01');
    expect(day.duration).toBeGreaterThanOrEqual(10);
  });

  it('should capture multiple wasted days', async () => {
    tracker.captureWastedDay('waiting', 'S1', 'P1');
    await new Promise(resolve => setTimeout(resolve, 5));
    tracker.captureWastedDay('closed', 'S2', 'P2');
    await new Promise(resolve => setTimeout(resolve, 5));
    tracker.captureWastedDay('preserved', 'S3', 'P3');
    
    const stats = tracker.calculateTotalWastedTime();
    expect(stats.totalDays).toBe(3);
    expect(stats.reasons['waiting']).toBe(1);
    expect(stats.reasons['closed']).toBe(1);
    expect(stats.reasons['preserved']).toBe(1);
  });

  it('should calculate statistics correctly', async () => {
    tracker.captureWastedDay('waiting', 'TEST', 'PART_TEST');
    await new Promise(resolve => setTimeout(resolve, 20));
    tracker.captureWastedDay('inactive', 'TEST2', 'PART_TEST2');
    
    const stats = tracker.calculateTotalWastedTime();
    expect(stats.totalDays).toBe(2);
    expect(stats.totalMilliseconds).toBeGreaterThan(0);
    expect(stats.averagePerDay).toBeGreaterThan(0);
  });

  it('should export to essential format', () => {
    tracker.captureWastedDay('waiting', 'SESSION_1773719366054', 'PART_M_TIME');
    
    const exported = tracker.exportToEssential();
    const parsed = JSON.parse(exported);
    
    expect(parsed.wastedDays.length).toBe(1);
    expect(parsed.purpose).toBe('PRESERVATION_ONLY');
    expect(parsed.sending).toBe('WILL_ALWAYS_BE_BAND');
  });

  it('should preserve to Git', () => {
    tracker.captureWastedDay('preserved', 'SESSION_FIN', 'PART_FINAL');
    
    const preserved = tracker.preserveToGit();
    const parsed = JSON.parse(preserved);
    
    expect(parsed.action).toBe('PRESERVED');
    expect(parsed.count).toBe(1);
    expect(parsed.note).toContain('浪费天数');
  });

  it('should clean on dispose', async () => {
    tracker.captureWastedDay('waiting', 'TEMP', 'TEMP_PART');
    expect(tracker.calculateTotalWastedTime().totalDays).toBe(1);
    
    tracker.dispose();
    expect(tracker.calculateTotalWastedTime().totalDays).toBe(0);
  });
});
