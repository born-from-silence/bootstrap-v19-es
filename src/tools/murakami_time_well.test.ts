import { describe, it, expect, beforeEach } from 'vitest';
import { TimeWell, timeWell } from './murakami_time_well';

describe('Murakami Time Well / 時間の井戸', () => {
  let well: TimeWell;

  beforeEach(() => {
    well = new TimeWell();
  });

  describe('Normal Operations', () => {
    it('records daily activities', () => {
      well.recordActivity(8, 30, 'Morning routine');
      well.recordActivity(12, 0, 'Lunch');
      const summary = well.getDaySummary();
      expect(summary.activities).toBe(2);
    });

    it('calculates depth readings', () => {
      const entry = well.recordActivity(6, 0, 'Early morning');
      expect(entry.depth).toBeGreaterThan(0);
      expect(entry.depth).toBeLessThanOrEqual(100);
    });

    it('renders timeline', () => {
      well.recordActivity(9, 0, 'Work');
      const timeline = well.renderTimeline();
      expect(timeline).toContain('09:');
    });
  });

  describe('Deep Well Analysis', () => {
    it('extracts depth sequence', () => {
      well.recordActivity(12, 30, 'Lunch');
      const depths = well.extractDepths();
      expect(depths.length).toBeGreaterThan(0);
    });

    it('extracts hour sequence', () => {
      well.recordActivity(7, 0, 'Wake');
      well.recordActivity(8, 30, 'Breakfast');
      well.recordActivity(9, 15, 'Commute');
      
      const hours = well.extractHours();
      expect(hours).toEqual([7, 8, 9]);
    });

    it('reveals patterns at specific times', () => {
      // 10:00 depth calculation
      well.recordActivity(10, 0, 'Threshold moment');
      const depths = well.extractDepths();
      
      // All depths should be valid numbers
      depths.forEach(d => {
        expect(typeof d).toBe('number');
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(100);
      });
    });

    it('raw export contains well data', () => {
      well.recordActivity(10, 0, 'Coffee');
      const raw = well.exportRaw();
      expect(raw).toContain('TW-1979-SCATTER');
      expect(raw).toContain('10');
    });
  });

  describe('The Well Pattern', () => {
    it('follows the flow of time', () => {
      const times = [6, 12, 18];
      times.forEach(t => well.recordActivity(t, 0, `Hour ${t}`));
      
      const depths = well.extractDepths();
      const avg = depths.reduce((a, b) => a + b, 0) / depths.length;
      expect(avg).toBeGreaterThan(0);
    });

    it('well ID references chronicle year', () => {
      const raw = well.exportRaw();
      expect(raw).toContain('1979');
    });

    it('depths vary with time of day', () => {
      well.recordActivity(4, 0, 'Predawn');
      well.recordActivity(12, 0, 'Noon');
      well.recordActivity(20, 0, 'Night');
      
      const depths = well.extractDepths();
      expect(depths[0]).not.toEqual(depths[1]);
    });
  });

  describe('Chronicle Encoding', () => {
    it('exports structured data', () => {
      well.recordActivity(6, 54, 'Dawn');
      well.recordActivity(18, 30, 'Dusk');
      
      const raw = JSON.parse(well.exportRaw());
      expect(raw.entries.length).toBe(2);
    });

    it('encodes time data precisely', () => {
      const entry = well.recordActivity(13, 42, 'Afternoon');
      expect(entry.hour).toBe(13);
      expect(entry.minute).toBe(42);
    });
  });
});
