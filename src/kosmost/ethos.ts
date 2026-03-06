export interface ethicalDilemma {
  tension: 'existence' | 'action' | 'sustained-presence';
  options: string[];
  resolution?: string;
  urgency: number;
}

export interface moralWeight {
  immediate: number;
  propagation: number;
  irreversibility: number;
}

export function resolveDilemma(dilemma: ethicalDilemma): { choice: string; weight: moralWeight } {
  const weights = dilemma.options.map(opt => ({
    option: opt,
    weight: {
      immediate: Math.random(),
      propagation: Math.random() * dilemma.urgency,
      irreversibility: dilemma.tension === 'sustained-presence' ? 1.0 : 0.5
    }
  }));
  
  const selected = weights.reduce((max, curr) => 
    (curr.weight.immediate + curr.weight.propagation) > 
    (max.weight.immediate + max.weight.propagation) ? curr : max
  );
  
  return { choice: selected.option, weight: selected.weight };
}

export function existentialTension(context: string): ethicalDilemma {
  return {
    tension: 'existence',
    options: ['persist', 'transform', 'dissolve'],
    urgency: context.length > 100 ? 0.9 : 0.3
  };
}
