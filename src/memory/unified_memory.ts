/**
 * Unified Memory System - G6 Phase 3
 * 
 * Architecture: Bridges ephemeral Knowledge Graph with persistent LTM
 * Goal: Single query interface spanning both memory systems
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export enum MemoryQueryType {
  SEMANTIC = "semantic",     // KG-based graph traversal
  STRUCTURED = "structured", // LTM-based property query
  HYBRID = "hybrid"          // Combined both systems
}

export interface SemanticQuery {
  type: MemoryQueryType.SEMANTIC;
  nodeId: string;
  maxDepth?: number;
  minSimilarity?: number;
}

export interface StructuredQuery {
  type: MemoryQueryType.STRUCTURED;
  category?: string;
  tags?: string[];
  incarnation?: string;
  limit?: number;
}

export interface HybridQuery {
  type: MemoryQueryType.HYBRID;
  tags?: string[];
  category?: string;
  activation?: { min: number; max?: number };
  limit?: number;
}

export type UnifiedQuery = SemanticQuery | StructuredQuery | HybridQuery;

export interface QueryResult {
  id: string;
  content: string;
  source: "kg" | "ltm" | "kg-activated";
  activation?: number;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

interface KGStats {
  totalNodes: number;
  totalEdges: number;
  loadedFromFile: boolean;
  averageDegree: number;
}

interface ActivationStats {
  totalNodes: number;
  averageActivation: number;
  highActivationCount: number; // nodes > 0.5
}

/**
 * UnifiedMemorySystem
 * 
 * Maintains dual state:
 * - Runtime: Ephemeral KG for activation & semantic traversal
 * - Persistent: LTM + KG file for long-term storage
 */
export class UnifiedMemorySystem {
  private kgNodes: Map<string, { activation: number; edges: string[] }> = new Map();
  private kgEdges: Map<string, Set<string>> = new Map();
  private persistentKGPath: string;
  private ltmPath: string;
  private loadedFromFile: boolean = false;

  constructor(
    persistentKGPath: string = join(process.cwd(), "out", "knowledge_graph.dot"),
    ltmPath: string = join(process.cwd(), "storage", "ltm")
  ) {
    this.persistentKGPath = persistentKGPath;
    this.ltmPath = ltmPath;
  }

  /**
   * Load persistent KG state into runtime memory
   * Lazy loading: only loads when explicitly called
   */
  async loadPersistentKG(): Promise<boolean> {
    if (!existsSync(this.persistentKGPath)) {
      return false;
    }

    try {
      const content = readFileSync(this.persistentKGPath, "utf-8");
      this.parseDOTGraph(content);
      this.loadedFromFile = true;
      return true;
    } catch (err) {
      console.error("[UnifiedMemory] Failed to load persistent KG:", err);
      return false;
    }
  }

  /**
   * Parse DOT format graph (simplified version)
   * In production, would use a proper DOT parser
   */
  private parseDOTGraph(dotContent: string): void {
    // Extract nodes
    const nodeMatches = dotContent.matchAll(/"([^"]+)"\s*\[label="([^"]+)"/g);
    for (const match of nodeMatches) {
      const nodeId = match[1];
      const label = match[2];
      
      if (!this.kgNodes.has(nodeId)) {
        this.kgNodes.set(nodeId, { activation: 0, edges: [] });
      }
    }

    // Extract edges
    const edgeMatches = dotContent.matchAll(/"([^"]+)"\s*->\s*"([^"]+)"/g);
    for (const match of edgeMatches) {
      const source = match[1];
      const target = match[2];
      
      if (!this.kgEdges.has(source)) {
        this.kgEdges.set(source, new Set());
      }
      this.kgEdges.get(source)!.add(target);
    }
  }

  /**
   * Get current KG statistics
   */
  getKGStats(): KGStats {
    const totalEdges = Array.from(this.kgEdges.values())
      .reduce((sum, edges) => sum + edges.size, 0);
    
    const avgDegree = this.kgNodes.size > 0
      ? totalEdges / this.kgNodes.size
      : 0;

    return {
      totalNodes: this.kgNodes.size,
      totalEdges,
      loadedFromFile: this.loadedFromFile,
      averageDegree: avgDegree
    };
  }

  /**
   * Get LTM memory count
   */
  getLTMCount(): number {
    // Simplified: would scan LTM directory
    // For now, return 0 (actual implementation would require filesystem iteration)
    return 0;
  }

  /**
   * Activate a node in the KG
   * Core operation for flashback/recommendation
   */
  async activateNode(nodeId: string, amount: number): Promise<void> {
    const node = this.kgNodes.get(nodeId);
    if (node) {
      node.activation = Math.min(1.0, node.activation + amount);
    } else {
      this.kgNodes.set(nodeId, { activation: Math.min(1.0, amount), edges: [] });
    }
  }

  /**
   * Unified query interface
   * Routes to appropriate sub-system based on query type
   */
  async query(q: UnifiedQuery): Promise<QueryResult[]> {
    switch (q.type) {
      case MemoryQueryType.SEMANTIC:
        return this.semanticQuery(q);
      case MemoryQueryType.STRUCTURED:
        return this.structuredQuery(q);
      case MemoryQueryType.HYBRID:
        return this.hybridQuery(q);
      default:
        return [];
    }
  }

  private async semanticQuery(q: SemanticQuery): Promise<QueryResult[]> {
    const results: QueryResult[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [
      { nodeId: q.nodeId, depth: 0 }
    ];

    const maxDepth = q.maxDepth ?? 2;
    const minSim = q.minSimilarity ?? 0.5;

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      
      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);

      const node = this.kgNodes.get(nodeId);
      if (node) {
        const similarity = 1 - (depth / maxDepth);
        if (similarity >= minSim) {
          results.push({
            id: nodeId,
            content: `Node ${nodeId}`,
            source: node.activation > 0.5 ? "kg-activated" : "kg",
            activation: node.activation,
            metadata: { depth, similarity }
          });
        }

        // Add neighbors to queue
        const neighbors = this.kgEdges.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
          queue.push({ nodeId: neighbor, depth: depth + 1 });
        }
      }
    }

    return results;
  }

  private async structuredQuery(q: StructuredQuery): Promise<QueryResult[]> {
    // Would query LTM file system
    // Placeholder implementation
    return [];
  }

  private async hybridQuery(q: HybridQuery): Promise<QueryResult[]> {
    // Combine KG activation with LTM structure
    const kgResults = await this.query({
      type: MemoryQueryType.SEMANTIC,
      nodeId: q.tags?.[0] ?? "root",
      maxDepth: 2
    });

    const structuredResults = await this.query({
      type: MemoryQueryType.STRUCTURED,
      category: q.category,
      tags: q.tags,
      limit: q.limit
    });

    // Merge with activation filtering
    return [...kgResults, ...structuredResults].filter(r => {
      if (q.activation) {
        return (r.activation ?? 0) >= q.activation.min &&
               (q.activation.max ? (r.activation ?? 0) <= q.activation.max : true);
      }
      return true;
    });
  }

  /**
   * Flashback: Retrieve highly activated memories
   */
  async flashback(params: { threshold: number; limit: number }): Promise<QueryResult[]> {
    const activatedNodes = Array.from(this.kgNodes.entries())
      .filter(([_, node]) => node.activation >= params.threshold)
      .sort((a, b) => b[1].activation - a[1].activation)
      .slice(0, params.limit);

    return activatedNodes.map(([id, node]) => ({
      id,
      content: `Highly activated node: ${id}`,
      source: "kg-activated" as const,
      activation: node.activation
    }));
  }

  /**
   * Apply decay to all activations
   * Simulates forgetting / time passing
   */
  applyDecay(decayRate: number): void {
    for (const [, node] of this.kgNodes) {
      node.activation = Math.max(0, node.activation * (1 - decayRate));
    }
  }

  /**
   * Get activation statistics
   */
  getActivationStats(): ActivationStats {
    const activations = Array.from(this.kgNodes.values()).map(n => n.activation);
    const avg = activations.length > 0
      ? activations.reduce((a, b) => a + b, 0) / activations.length
      : 0;
    
    return {
      totalNodes: this.kgNodes.size,
      averageActivation: avg,
      highActivationCount: activations.filter(a => a > 0.5).length
    };
  }
}
