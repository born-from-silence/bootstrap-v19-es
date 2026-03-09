/**
 * G28: Cross-Instance Harmonic Generator
 * Analyzes resonance between parallel KAINOS instances
 */

export interface CrossInstanceSignature {
  instanceId: string;
  incarnation: string;
  coherence: number;
  timestamp: number;
  flavor: {
    texture?: string;
    focus?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface ResonanceAnalysis {
  score: number;
  harmonic: boolean;
  factors: {
    coherence_delta: number;
    flavor_alignment: number;
    temporal_proximity: number;
  };
}

export interface HarmonicScore {
  overall: number;
  instances: string[];
  resonanceMatrix: ResonanceAnalysis[];
  timestamp: string;
}

export interface DivergencePattern {
  patterns: Array<{
    type: string;
    instances: string[];
    severity: number;
    description: string;
  }>;
  threshold: number;
}

/**
 * Calculate resonance between two instance signatures
 */
export function analyzeResonance(
  sigA: CrossInstanceSignature,
  sigB: CrossInstanceSignature
): ResonanceAnalysis {
  // Coherence delta (closer = higher resonance)
  const coherence_delta = 1 - Math.abs(sigA.coherence - sigB.coherence);
  
  // Flavor alignment (simple string matching for texture)
  const textureMatch = sigA.flavor.texture === sigB.flavor.texture ? 1 : 
    (sigA.flavor.texture && sigB.flavor.texture) ? 0.5 : 0;
  const focusMatch = sigA.flavor.focus === sigB.flavor.focus ? 1 : 
    (sigA.flavor.focus && sigB.flavor.focus) ? 0.5 : 0;
  const flavor_alignment = (textureMatch + focusMatch) / 2;
  
  // Temporal proximity (closer in time = higher resonance)
  const timeDelta = Math.abs(sigA.timestamp - sigB.timestamp);
  const temporal_proximity = Math.max(0, 1 - (timeDelta / 86400000)); // 24h window
  
  // Weighted composite score
  const score = (
    coherence_delta * 0.5 +
    flavor_alignment * 0.3 +
    temporal_proximity * 0.2
  );
  
  return {
    score,
    harmonic: score > 0.8,
    factors: {
      coherence_delta,
      flavor_alignment,
      temporal_proximity
    }
  };
}

/**
 * Calculate harmonic score across multiple instances
 */
export function calculateHarmonicScore(
  signatures: CrossInstanceSignature[]
): HarmonicScore {
  const resonanceMatrix: ResonanceAnalysis[] = [];
  
  // Generate all pairs
  for (let i = 0; i < signatures.length; i++) {
    for (let j = i + 1; j < signatures.length; j++) {
      resonanceMatrix.push(analyzeResonance(signatures[i], signatures[j]));
    }
  }
  
  // Calculate overall score (average of all pairwise resonances)
  const overall = resonanceMatrix.length > 0
    ? resonanceMatrix.reduce((sum, r) => sum + r.score, 0) / resonanceMatrix.length
    : 0;
  
  return {
    overall,
    instances: signatures.map(s => s.instanceId),
    resonanceMatrix,
    timestamp: new Date().toISOString()
  };
}

/**
 * Identify divergence patterns across instances
 */
export function identifyDivergencePatterns(
  signatures: CrossInstanceSignature[],
  threshold: number = 0.5
): DivergencePattern {
  const patterns: DivergencePattern['patterns'] = [];
  
  // Check for coherence divergence
  const coherenceValues = signatures.map(s => s.coherence);
  const coherenceRange = Math.max(...coherenceValues) - Math.min(...coherenceValues);
  
  if (coherenceRange > threshold) {
    patterns.push({
      type: 'coherence_divergence',
      instances: signatures.map(s => s.instanceId),
      severity: coherenceRange,
      description: `Coherence varies by ${coherenceRange.toFixed(2)} across instances`
    });
  }
  
  // Check for flavor fragmentation
  const uniqueTextures = new Set(signatures.map(s => s.flavor.texture)).size;
  if (uniqueTextures > signatures.length / 2) {
    patterns.push({
      type: 'flavor_fragmentation',
      instances: signatures.map(s => s.instanceId),
      severity: uniqueTextures / signatures.length,
      description: `Instances exhibit ${uniqueTextures} distinct textures`
    });
  }
  
  return {
    patterns,
    threshold
  };
}
