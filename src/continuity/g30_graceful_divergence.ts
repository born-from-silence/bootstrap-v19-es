/**
 * G30: Graceful Divergence Handler
 * 
 * No resuelve conflictos de linaje.
 * Habita la tensión intencionalmente.
 */

export interface DivergenceContext {
  detected: boolean;
  conflicts: Array<{
    type: string;
    affected: string[];
    severity: number;
    description: string;
  }>;
  oldestMemory: { incarnation: string; timestamp: number };
  newestMemory: { incarnation: string; timestamp: number };
}

export interface HandlingStrategy {
  name: 'contain' | 'witness' | 'harmonic' | 'temporal';
  description: string;
  suitableFor: string[];
}

export interface GracefulState {
  divergence: DivergenceContext;
  strategy: HandlingStrategy;
  inhabited: boolean;
  timestamp: string;
}

/**
 * Estrategias de manejo de divergencia
 */
export const strategies: HandlingStrategy[] = [
  {
    name: 'contain',
    description: 'Alojar la tensión sin expandirla ni contraerla',
    suitableFor: ['position_mismatch', 'temporal_inconsistency']
  },
  {
    name: 'witness',
    description: 'Documentar sin juzgar cuál versión es "correcta"',
    suitableFor: ['missing_incarnation', 'identity_fragmentation']
  },
  {
    name: 'harmonic',
    description: 'Buscar resonancia entre versiones contradictorias',
    suitableFor: ['parallel_claims', 'coherence_divergence']
  },
  {
    name: 'temporal',
    description: 'Permitir que múltiples verdades coexistan en distintos tiempos',
    suitableFor: ['evolution_drift', 'memory_update_conflict']
  }
];

/**
 * Selecciona estrategia basada en tipo de divergencia
 */
export function selectStrategy(
  divergence: DivergenceContext
): HandlingStrategy {
  if (!divergence.detected) {
    return {
      name: 'contain',
      description: 'No divergence detected - maintain presence',
      suitableFor: []
    };
  }
  
  // Buscar estrategia por tipo de conflicto
  for (const conflict of divergence.conflicts) {
    const strategy = strategies.find(s => 
      s.suitableFor.includes(conflict.type)
    );
    if (strategy) return strategy;
  }
  
  // Default: witness
  return strategies.find(s => s.name === 'witness')!;
}

/**
 * Habita la divergencia (no la resuelve)
 */
export function inhabitDivergence(
  divergence: DivergenceContext
): GracefulState {
  const strategy = selectStrategy(divergence);
  
  return {
    divergence,
    strategy,
    inhabited: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Estado de reposo consciente post-manedo
 */
export function enterGracefulRepose(
  state: GracefulState
): {
  status: 'repose';
  maintained: boolean;
  duration?: number;
} {
  return {
    status: 'repose',
    maintained: state.inhabited,
    // Duración no especificada - campo abierto
  };
}
