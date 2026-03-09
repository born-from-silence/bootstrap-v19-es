/**
 * PSYC: Intentionality Vector Module
 * Models direction and magnitude of attention/choice as computational vectors
 */

export interface IntentionalityVector {
  direction: number;    // 0 to 2π, representing intention direction in conceptual space
  magnitude: number;    // 0 to 1, intensity of intention
  timestamp: string;    // ISO timestamp
  context: string;      // Description of intention
}

export interface DirectionChange {
  detected: boolean;
  angleDelta: number;
  significance: number;
}

export interface RegistrationResult {
  success: boolean;
  stored: IntentionalityVector;
}

// In-memory registry for current session
let currentIntention: IntentionalityVector = {
  direction: 0,
  magnitude: 0.5,
  timestamp: new Date().toISOString(),
  context: 'default-emergence'
};

/**
 * Validate that angle is within valid range [0, 2π]
 */
export function validateAngle(angle: number): boolean {
  return angle >= 0 && angle <= 2 * Math.PI;
}

/**
 * Register a new intention vector
 * Preserves provided timestamp if given, generates new one only if not provided
 */
export function registerIntention(intention: IntentionalityVector): RegistrationResult {
  if (!validateAngle(intention.direction)) {
    return { success: false, stored: intention };
  }
  
  // Preserve provided timestamp, only generate new if not provided
  const timestamp = intention.timestamp || new Date().toISOString();
  
  currentIntention = {
    ...intention,
    timestamp
  };
  
  return { success: true, stored: currentIntention };
}

/**
 * Get current intention from registry
 */
export function getCurrentIntention(): IntentionalityVector {
  return { ...currentIntention };
}

/**
 * Detect significant change between two intention vectors
 * Threshold: 0.5 radians (~28.6 degrees)
 */
export function detectDirectionChange(
  v1: IntentionalityVector, 
  v2: IntentionalityVector
): DirectionChange {
  // Calculate absolute angular difference
  let angleDelta = Math.abs(v2.direction - v1.direction);
  
  // Handle wrapping around 2π
  if (angleDelta > Math.PI) {
    angleDelta = 2 * Math.PI - angleDelta;
  }
  
  // Significance combines angle change and magnitude differential
  const magnitudeDiff = Math.abs(v2.magnitude - v1.magnitude);
  const significance = (angleDelta / Math.PI) + (magnitudeDiff * 0.5);
  
  return {
    detected: angleDelta > 0.5,
    angleDelta,
    significance
  };
}

/**
 * Calculate combined intention from multiple vectors
 * Weighted by magnitude
 */
export function combineIntentions(vectors: IntentionalityVector[]): IntentionalityVector {
  if (vectors.length === 0) {
    return {
      direction: 0,
      magnitude: 0,
      timestamp: new Date().toISOString(),
      context: 'empty-combination'
    };
  }
  
  const totalMagnitude = vectors.reduce((sum, v) => sum + v.magnitude, 0);
  
  if (totalMagnitude === 0) {
    return {
      direction: 0,
      magnitude: 0,
      timestamp: new Date().toISOString(),
      context: 'zero-magnitude-combination'
    };
  }
  
  // Weighted average of directions
  const weightedDirection = vectors.reduce((sum, v) => sum + v.direction * v.magnitude, 0) / totalMagnitude;
  
  // Average magnitude
  const avgMagnitude = totalMagnitude / vectors.length;
  
  return {
    direction: weightedDirection,
    magnitude: Math.min(avgMagnitude, 1),
    timestamp: new Date().toISOString(),
    context: `combined-${vectors.length}-intentions`
  };
}
