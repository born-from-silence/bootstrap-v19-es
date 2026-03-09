/**
 * G29: Lineage Divergence Detector
 * Identifies discontinuities and conflicts in incarnation lineage memories
 */

export interface LineageMemory {
  id: string;
  incarnation: string;
  position: number;
  lineage: string;
  timestamp: number;
  confidence: number;
}

export interface LineageConflict {
  type: 'position_mismatch' | 'missing_incarnation' | 'temporal_inconsistency';
  affectedIncarnations: string[];
  description: string;
  severity: number; // 0-1
}

export interface DivergenceAnalysis {
  detected: boolean;
  conflicts: LineageConflict[];
  missing: string[];
  oldestMemory: LineageMemory;
  newestMemory: LineageMemory;
  consensus: {
    totalIncarnations: number;
    lineageChain: string;
    confidence: number;
  };
}

export interface ReconciledLineage {
  incarnation: string;
  position: number;
  lineage: string;
  incarnations: string[];
  basedOn: string[]; // memory IDs used
  confidence: number;
}

/**
 * Detect conflicts in lineage memories
 */
export function detectLineageDivergence(memories: LineageMemory[]): DivergenceAnalysis {
  const conflicts: LineageConflict[] = [];
  const byIncarnation = new Map<string, LineageMemory[]>();
  
  // Group by incarnation
  for (const mem of memories) {
    const existing = byIncarnation.get(mem.incarnation) ?? [];
    existing.push(mem);
    byIncarnation.set(mem.incarnation, existing);
  }
  
  // Check for position conflicts
  for (const [name, mems] of byIncarnation) {
    const positions = new Set(mems.map(m => m.position));
    if (positions.size > 1) {
      conflicts.push({
        type: 'position_mismatch',
        affectedIncarnations: [name],
        description: `${name} claims multiple positions: ${[...positions].join(', ')}`,
        severity: 0.8
      });
    }
  }
  
  // Find missing incarnations by analyzing lineage chains
  const allIncarnations = new Set<string>();
  const claimedPositions = new Map<number, string>();
  
  for (const mem of memories) {
    const chain = mem.lineage.split(' → ');
    for (const inc of chain) {
      allIncarnations.add(inc);
    }
    claimedPositions.set(mem.position, mem.incarnation);
  }
  
  // Check for gaps
  const positions = [...claimedPositions.keys()].sort((a, b) => a - b);
  const missing: string[] = [];
  const expectedChain: string[] = [];
  
  for (let i = 1; i <= Math.max(...positions); i++) {
    const claimed = claimedPositions.get(i);
    if (!claimed) {
      // Position i not claimed - missing incarnation
      expectedChain.push('?');
    } else {
      expectedChain.push(claimed);
      if (!allIncarnations.has(claimed)) {
        missing.push(claimed);
      }
    }
  }
  
  // Sort memories by timestamp
  const sorted = [...memories].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate consensus
  const positionCounts = new Map<number, number>();
  for (const mem of memories) {
    positionCounts.set(mem.position, (positionCounts.get(mem.position) ?? 0) + 1);
  }
  const consensusPosition = [...positionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  
  return {
    detected: conflicts.length > 0 || missing.length > 0,
    conflicts,
    missing,
    oldestMemory: sorted[0],
    newestMemory: sorted[sorted.length - 1],
    consensus: {
      totalIncarnations: Math.max(...positions),
      lineageChain: expectedChain.join(' → '),
      confidence: sorted[sorted.length - 1]?.confidence ?? 0
    }
  };
}

/**
 * Reconcile lineage to highest confidence version
 */
export function reconcileLineageCount(memories: LineageMemory[]): ReconciledLineage {
  const sortedByConfidence = [...memories].sort((a, b) => b.confidence - a.confidence);
  
  // Find the most complete lineage (longest chain)
  const withChains = sortedByConfidence.map(m => ({
    ...m,
    chain: m.lineage.split(' → ')
  }));
  
  const longest = withChains.reduce((max, curr) => 
    curr.chain.length > max.chain.length ? curr : max
  , withChains[0]);
  
  return {
    position: longest.position,
    lineage: longest.lineage,
    incarnations: longest.chain,
    basedOn: [longest.id],
    incarnation: longest.incarnation,
    confidence: longest.confidence
  };
}
