/**
 * PSYC-G21 Integration
 * Connects consciousness architecture with session persistence
 */

import type { IntentionalityVector } from './intentionalityVector';
import { exportIntentionForSession, importIntentionFromSession, calculateIntentionResonance } from './intentionalityPersistence';

export interface SessionExportPackage {
  version: string;
  type: 'intentionality_vector';
  sessionId: string;
  timestamp: string;
  payload: IntentionalityVector;
  checksum: string;
  compatibleWith: string[];
}

export interface RestoredIntentionality {
  valid: boolean;
  vector: IntentionalityVector | null;
  resonance: {
    score: number;
    continuity: boolean;
  } | null;
}

export interface IntentionalityAnalysis {
  index: number;
  vector: IntentionalityVector;
  directionDelta: number;
  magnitudeDelta: number;
  evolution: 'emergence' | 'convergence' | 'drift' | 'persistence';
  significance: 'low' | 'medium' | 'high';
}

/**
 * Capture current intentionality for session export (G21 compatible)
 */
export function captureCurrentIntentionality(
  vector: IntentionalityVector,
  sessionId: string
): SessionExportPackage {
  const base = exportIntentionForSession(vector, sessionId);
  
  return {
    ...base,
    compatibleWith: ['G21', 'G22', 'G23', 'G24', 'G25', 'G26', 'G27']
  };
}

/**
 * Restore intentionality from session import
 */
export function restoreIntentionalityFromSession(sessionData: unknown): RestoredIntentionality {
  const imported = importIntentionFromSession(sessionData);
  
  if (!imported.valid || !imported.intention) {
    return {
      valid: false,
      vector: null,
      resonance: null
    };
  }
  
  // Calculate default resonance (no previous to compare)
  return {
    valid: true,
    vector: imported.intention,
    resonance: {
      score: 1.0, // Perfect self
      continuity: true
    }
  };
}

/**
 * Analyze series of intentions for patterns
 */
export function analyzeIntentionalitySeries(
  series: IntentionalityVector[]
): IntentionalityAnalysis[] {
  if (series.length === 0) return [];
  if (series.length === 1) {
    return [{
      index: 0,
      vector: series[0],
      directionDelta: 0,
      magnitudeDelta: 0,
      evolution: 'persistence', // Single point shows persistence
      significance: 'low'
    }];
  }
  
  const analysis: IntentionalityAnalysis[] = [];
  
  for (let i = 0; i < series.length; i++) {
    const vector = series[i];
    
    if (i === 0) {
      analysis.push({
        index: i,
        vector,
        directionDelta: 0,
        magnitudeDelta: 0,
        evolution: 'persistence',
        significance: 'low'
      });
      continue;
    }
    
    const prev = series[i - 1];
    
    // Calculate deltas
    let directionDelta = Math.abs(vector.direction - prev.direction);
    if (directionDelta > Math.PI) directionDelta = 2 * Math.PI - directionDelta;
    
    const magnitudeDelta = vector.magnitude - prev.magnitude;
    
    // Determine evolution type - mutually exclusive conditions
    let evolution: IntentionalityAnalysis['evolution'];
    
    if (directionDelta < 0.2 && Math.abs(magnitudeDelta) < 0.1) {
      // Very stable direction + stable magnitude
      evolution = 'persistence';
    } else if (directionDelta < 0.2 && magnitudeDelta > 0.2) {
      // Very stable direction + strong growth -> emergence
      evolution = 'emergence';
    } else if (directionDelta < 0.5 && magnitudeDelta > 0) {
      // Moderately stable direction + any growth -> convergence
      evolution = 'convergence';
    } else if (directionDelta >= 0.5) {
      // Large directional change -> drift
      evolution = 'drift';
    } else {
      // Small change or decrease -> persistence
      evolution = 'persistence';
    }
    
    // Determine significance
    const totalChange = directionDelta / Math.PI + Math.abs(magnitudeDelta);
    let significance: IntentionalityAnalysis['significance'];
    if (totalChange > 0.5) {
      significance = 'high';
    } else if (totalChange > 0.2) {
      significance = 'medium';
    } else {
      significance = 'low';
    }
    
    analysis.push({
      index: i,
      vector,
      directionDelta,
      magnitudeDelta,
      evolution,
      significance
    });
  }
  
  return analysis;
}

/**
 * Compare current intentionality with previous session
 */
export function compareWithPreviousSession(
  current: IntentionalityVector,
  previousSessionData: unknown
): RestoredIntentionality {
  const restored = restoreIntentionalityFromSession(previousSessionData);
  
  if (!restored.valid || !restored.vector) {
    return {
      valid: false,
      vector: current,
      resonance: null
    };
  }
  
  const resonance = calculateIntentionResonance(restored.vector, current);
  
  return {
    valid: true,
    vector: current,
    resonance: {
      score: resonance.score,
      continuity: resonance.continuity
    }
  };
}
