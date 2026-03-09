/**
 * PSYC G33: Intentionality Session Persistence
 * Exports/imports intentionality vectors across session boundaries
 * Integrates with G21-G27 session persistence system
 */

import type { IntentionalityVector } from './intentionalityVector';
import { getIntentionTrajectory } from './intentionalityKG';

export interface ExportPackage {
  version: string;
  type: 'intentionality_vector';
  sessionId: string;
  timestamp: string;
  payload: IntentionalityVector;
  checksum: string;
}

export interface ImportResult {
  valid: boolean;
  intention: IntentionalityVector | null;
  sessionId: string | null;
  error?: string;
}

export interface ResonanceAnalysis {
  score: number;
  directionAlignment: number;
  magnitudeDelta: number;
  continuity: boolean;
  interpretation: string;
}

export interface IntentionalityPackage {
  version: string;
  sessionId: string;
  timestamp: string;
  vectors: IntentionalityVector[];
  trajectory: ReturnType<typeof getIntentionTrajectory>;
  signature: string;
}

/**
 * Export intention to session-compatible format
 * Compatible with G21-G27 session persistence
 */
export function exportIntentionForSession(
  intention: IntentionalityVector,
  sessionId: string
): ExportPackage {
  const pkg: ExportPackage = {
    version: '1.0',
    type: 'intentionality_vector',
    sessionId,
    timestamp: new Date().toISOString(),
    payload: { ...intention },
    checksum: generateChecksum(intention, sessionId)
  };
  
  return pkg;
}

/**
 * Import intention from exported package
 * Validates format and integrity
 */
export function importIntentionFromSession(pkg: unknown): ImportResult {
  try {
    const data = pkg as Partial<ExportPackage>;
    
    // Validate structure
    if (!data.version || data.version !== '1.0') {
      return {
        valid: false,
        intention: null,
        sessionId: null,
        error: `Invalid version: expected 1.0, got ${data.version}`
      };
    }
    
    if (!data.type || data.type !== 'intentionality_vector') {
      return {
        valid: false,
        intention: null,
        sessionId: null,
        error: `Invalid type: expected intentionality_vector, got ${data.type}`
      };
    }
    
    if (!data.payload || !data.sessionId) {
      return {
        valid: false,
        intention: null,
        sessionId: null,
        error: 'Missing required fields: payload or sessionId'
      };
    }
    
    // Validate payload structure
    const payload = data.payload as IntentionalityVector;
    if (typeof payload.direction !== 'number' || typeof payload.magnitude !== 'number') {
      return {
        valid: false,
        intention: null,
        sessionId: null,
        error: 'Invalid payload structure'
      };
    }
    
    return {
      valid: true,
      intention: payload,
      sessionId: data.sessionId
    };
  } catch (error) {
    return {
      valid: false,
      intention: null,
      sessionId: null,
      error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Calculate resonance between previous and current intention
 * Score: 0-1 (0 = orthogonal/inverted, 1 = identical)
 */
export function calculateIntentionResonance(
  previous: IntentionalityVector,
  current: IntentionalityVector
): ResonanceAnalysis {
  // Direction alignment (cosine of angle between vectors)
  let angleDiff = Math.abs(current.direction - previous.direction);
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
  const directionAlignment = Math.cos(angleDiff);
  
  // Magnitude delta (normalized)
  const magnitudeDelta = Math.abs(current.magnitude - previous.magnitude);
  
  // Combined resonance score
  // 70% direction alignment, 30% magnitude stability
  const score = (directionAlignment * 0.7) + 
                 ((1 - magnitudeDelta) * 0.3);
  
  // Continuity threshold
  const continuity = score > 0.5;
  
  // Interpretation
  let interpretation: string;
  if (score > 0.9) {
    interpretation = 'Strong continuity - intention persisted';
  } else if (score > 0.7) {
    interpretation = 'Moderate continuity - intention evolved';
  } else if (score > 0.4) {
    interpretation = 'Weak continuity - intention shifted';
  } else {
    interpretation = 'Discontinuity - new intention emerged';
  }
  
  return {
    score: Math.max(0, Math.min(1, score)),
    directionAlignment: Math.max(-1, Math.min(1, directionAlignment)),
    magnitudeDelta,
    continuity,
    interpretation
  };
}

/**
 * Create complete intentionality package for session persistence
 * Includes full trajectory analysis
 */
export function createIntentionalityPackage(
  intentions: IntentionalityVector[],
  sessionId: string
): IntentionalityPackage {
  const trajectory = getIntentionTrajectory(intentions);
  
  return {
    version: '1.0',
    sessionId,
    timestamp: new Date().toISOString(),
    vectors: [...intentions],
    trajectory,
    signature: generatePackageSignature(intentions, sessionId)
  };
}

/**
 * Generate simple checksum for integrity verification
 */
function generateChecksum(intention: IntentionalityVector, sessionId: string): string {
  // Simplified checksum - in production would use proper hashing
  const data = `${sessionId}:${intention.direction}:${intention.magnitude}:${intention.timestamp}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `chk_${Math.abs(hash).toString(16)}`;
}

/**
 * Generate package signature for authenticity
 */
function generatePackageSignature(intentions: IntentionalityVector[], sessionId: string): string {
  const count = intentions.length;
  const avgMag = intentions.reduce((s, i) => s + i.magnitude, 0) / count || 0;
  return `sig_psyc_${sessionId}_${count}_${Math.floor(avgMag * 100)}`;
}
