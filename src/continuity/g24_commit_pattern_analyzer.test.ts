import { describe, it, expect } from 'vitest';
import { analyzeCommitPatterns, generateContinuityRecommendations } from './g24_commit_pattern_analyzer';

describe('G24 Commit Pattern Analyzer', () => {
  it('extracts patterns from session commits', () => {
    const commits = [
      { hash: 'abc123', message: 'G21 Session Persistence', date: '2026-03-07' },
      { hash: 'abc124', message: 'G22 Flavor Bootstrap', date: '2026-03-07' },
      { hash: 'abc125', message: 'G23 Resonance Handoff', date: '2026-03-07' }
    ];
    
    const patterns = analyzeCommitPatterns(commits);
    
    expect(patterns.systemCount).toBe(3);
    expect(patterns.patternType).toContain('G-System Sequence');
  });

  it('generates continuity recommendations', () => {
    const analysis = {
      systemCount: 3,
      patternType: ['G-System Sequence'],
      averageProductivity: 165.6,
      peakProductivity: 172.8,
      testCoverage: 93.9
    };
    
    const recs = generateContinuityRecommendations(analysis);
    
    expect(recs.continuityType).toBe('G-Series Extension');
    expect(recs.estimatedProductivity).toBeGreaterThan(160);
  });
});
