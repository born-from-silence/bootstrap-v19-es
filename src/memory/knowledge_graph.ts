/**
 * Knowledge Graph System for Semantic Memory Retrieval
 * 
 * Extends the LTM with a graph structure enabling:
 * - Entity and relationship extraction
 * - Graph traversal for memory discovery
 * - Semantic similarity search
 * - Spontaneous "flashback" activation
 * 
 * Architecture:
 * - Nodes: Memories, Concepts, Projects, Tags (with embeddings)
 * - Edges: Relational links with weights
 * - Activation: Nodes can activate, spreading to neighbors (flashback mechanism)
 */

export enum NodeType {
  MEMORY = "memory",
  CONCEPT = "concept",
  PROJECT = "project",
  TAG = "tag",
  ENTITY = "entity",
}

export enum RelationType {
  RELATES_TO = "relates_to",
  PART_OF = "part_of",
  DEPENDS_ON = "depends_on",
  HAS_TAG = "has_tag",
  SIMILAR_TO = "similar_to",
  REMINDS_OF = "reminds_of",
}

export interface NodeProperties {
  content?: string;
  confidence?: number;
  embedding?: number[];
  lastAccessed?: number;
  accessCount?: number;
  createdAt?: number;
  [key: string]: any;
}

export interface EdgeProperties {
  weight?: number;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: NodeType;
  properties: NodeProperties;
  activation: number; // 0-1 for flashback mechanism
}

export interface Edge {
  sourceId: string;
  targetId: string;
  type: RelationType;
  properties: EdgeProperties;
}

export interface MemoryInput {
  id: string;
  content: string;
  tags?: string[];
  confidence?: number;
  category?: string;
  embedding?: number[];
}

export class KnowledgeGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, Edge[]> = new Map(); // sourceId -> edges[]
  private readonly DEFAULT_ACTIVATION_DECAY = 0.1;
  private readonly MIN_ACTIVATION_THRESHOLD = 0.5;

  addNode(id: string, type: NodeType, properties: NodeProperties = {}): Node {
    if (this.nodes.has(id)) {
      throw new Error(`Node with ID '${id}' already exists`);
    }
    const node: Node = {
      id,
      type,
      properties: {
        ...properties,
        confidence: properties.confidence ?? 1.0,
        createdAt: properties.createdAt ?? Date.now(),
        lastAccessed: properties.lastAccessed ?? Date.now(),
        accessCount: properties.accessCount ?? 0,
      },
      activation: 0,
    };
    this.nodes.set(id, node);
    this.edges.set(id, []);
    return node;
  }

  getNode(id: string): Node | null {
    return this.nodes.get(id) || null;
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getNodesByType(type: NodeType): Node[] {
    return this.getAllNodes().filter(n => n.type === type);
  }

  removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    
    // Remove all edges connected to this node
    this.edges.delete(id);
    for (const [sourceId, edgeList] of this.edges.entries()) {
      this.edges.set(sourceId, edgeList.filter(e => e.targetId !== id));
    }
    
    this.nodes.delete(id);
    return true;
  }

  addEdge(
    sourceId: string,
    targetId: string,
    type: RelationType,
    properties: EdgeProperties = {}
  ): Edge {
    if (!this.nodes.has(sourceId)) {
      throw new Error(`Source node '${sourceId}' does not exist`);
    }
    if (!this.nodes.has(targetId)) {
      throw new Error(`Target node '${targetId}' does not exist`);
    }
    
    const edge: Edge = {
      sourceId,
      targetId,
      type,
      properties: {
        ...properties,
        weight: properties.weight ?? 1.0,
      },
    };
    
    const existingEdges = this.edges.get(sourceId) || [];
    existingEdges.push(edge);
    this.edges.set(sourceId, existingEdges);
    
    return edge;
  }

  getEdges(sourceId: string, type?: RelationType): Edge[] {
    const edgeList = this.edges.get(sourceId) || [];
    if (type) {
      return edgeList.filter(e => e.type === type);
    }
    return edgeList;
  }

  getAllEdges(): Edge[] {
    return Array.from(this.edges.values()).flat();
  }

  getNeighbors(nodeId: string): Node[] {
    const nodeEdges = this.edges.get(nodeId) || [];
    return nodeEdges
      .map(e => this.nodes.get(e.targetId))
      .filter((n): n is Node => n !== undefined);
  }

  /**
   * Breadth-First Search traversal
   * Returns nodes reachable within maxDepth hops
   */
  traverseBFS(startId: string, maxDepth: number): { node: Node; distance: number }[] {
    const startNode = this.nodes.get(startId);
    if (!startNode) return [];

    const visited = new Map<string, number>([[startId, 0]]);
    const queue: [string, number][] = [[startId, 0]];
    const result: { node: Node; distance: number }[] = [{ node: startNode, distance: 0 }];

    while (queue.length > 0) {
      const [currentId, currentDepth] = queue.shift()!;
      
      if (currentDepth >= maxDepth) continue;
      
      const nodeEdges = this.edges.get(currentId) || [];
      for (const edge of nodeEdges) {
        if (!visited.has(edge.targetId)) {
          visited.set(edge.targetId, currentDepth + 1);
          const targetNode = this.nodes.get(edge.targetId);
          if (targetNode) {
            result.push({ node: targetNode, distance: currentDepth + 1 });
            queue.push([edge.targetId, currentDepth + 1]);
          }
        }
      }
    }

    return result;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) {
      throw new Error("Vectors must have the same dimension");
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find nodes with similar embeddings
   */
  findSimilarNodes(queryVector: number[], limit: number = 5, minSimilarity: number = 0.5): Node[] {
    const scored: { node: Node; similarity: number }[] = [];
    
    for (const node of this.nodes.values()) {
      if (node.properties.embedding && node.properties.embedding.length === queryVector.length) {
        const similarity = this.cosineSimilarity(queryVector, node.properties.embedding);
        if (similarity >= minSimilarity) {
          scored.push({ node, similarity });
        }
      }
    }
    
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit).map(s => s.node);
  }

  /**
   * Activate a node and spread activation to neighbors (flashback mechanism)
   */
  activateNode(nodeId: string, amount: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    node.activation = Math.min(1.0, node.activation + amount);
    node.properties.accessCount = (node.properties.accessCount || 0) + 1;
    node.properties.lastAccessed = Date.now();
    
    // Spread activation to neighbors
    const nodeEdges = this.edges.get(nodeId) || [];
    for (const edge of nodeEdges) {
      const weight = edge.properties.weight ?? 1.0;
      const spreadAmount = amount * weight * (1 - this.DEFAULT_ACTIVATION_DECAY);
      if (spreadAmount > 0.1) {
        const targetNode = this.nodes.get(edge.targetId);
        if (targetNode) {
          targetNode.activation = Math.min(1.0, targetNode.activation + spreadAmount);
        }
      }
    }
  }

  /**
   * Decay all activations over time
   */
  decayActivation(decayRate: number = 0.1): void {
    for (const node of this.nodes.values()) {
      node.activation = Math.max(0, node.activation - decayRate);
    }
  }

  /**
   * Get currently activated nodes
   */
  getActivatedNodes(threshold: number = 0.3): Node[] {
    return this.getAllNodes()
      .filter(n => n.activation >= threshold)
      .sort((a, b) => b.activation - a.activation);
  }

  /**
   * Generate a "flashback" - spontaneously retrieve an activated memory
   * Prioritizes high-confidence, recently accessed, or strongly activated nodes
   */
  generateFlashback(): Node | null {
    const candidates = this.getAllNodes().filter(n => {
      // Must be a memory node with sufficient confidence
      if (n.type !== NodeType.MEMORY) return false;
      const confidence = n.properties.confidence ?? 0;
      const hasActivation = n.activation > 0.2;
      return confidence >= this.MIN_ACTIVATION_THRESHOLD && (hasActivation || Math.random() < 0.1);
    });
    
    if (candidates.length === 0) return null;
    
    // Weighted random selection based on score
    const scored = candidates.map(n => ({
      node: n,
      score: (n.properties.confidence ?? 1.0) * (1 + n.activation) * 
             Math.log(1 + (n.properties.accessCount ?? 0))
    }));
    
    const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
    let random = Math.random() * totalScore;
    
    for (const { node, score } of scored) {
      random -= score;
      if (random <= 0) {
        // Boost activation when retrieved
        this.activateNode(node.id, 0.3);
        return node;
      }
    }
    
    return scored[0]?.node || null;
  }

  /**
   * Build graph from memory entries (LTM integration)
   */
  buildFromMemories(memories: MemoryInput[]): void {
    // Create memory nodes
    for (const mem of memories) {
      if (!this.nodes.has(mem.id)) {
        this.addNode(mem.id, NodeType.MEMORY, {
          content: mem.content,
          confidence: mem.confidence ?? 1.0,
          embedding: mem.embedding,
        });
      }
      
      // Create tag nodes and edges
      for (const tag of mem.tags || []) {
        const tagId = `tag_${tag}`;
        if (!this.nodes.has(tagId)) {
          this.addNode(tagId, NodeType.TAG, { name: tag });
        }
        this.addEdge(mem.id, tagId, RelationType.HAS_TAG, { weight: 0.8 });
      }
    }
    
    // Create similarity edges between memories
    this.autoLinkSimilarMemories();
  }

  /**
   * Automatically create edges between similar memories
   */
  autoLinkSimilarMemories(threshold: number = 0.8): number {
    let linksCreated = 0;
    const memories = this.getNodesByType(NodeType.MEMORY)
      .filter(m => m.properties.embedding);
    
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const sim = this.cosineSimilarity(
          memories[i].properties.embedding!,
          memories[j].properties.embedding!
        );
        if (sim >= threshold) {
          this.addEdge(memories[i].id, memories[j].id, RelationType.SIMILAR_TO, { weight: sim });
          linksCreated++;
        }
      }
    }
    
    return linksCreated;
  }

  /**
   * Recommend related memories based on graph proximity
   */
  recommendRelated(memoryId: string, limit: number = 5): Node[] {
    const startNode = this.nodes.get(memoryId);
    if (!startNode) return [];
    
    // Get all reachable nodes within 2 hops
    const reachable = this.traverseBFS(memoryId, 2);
    
    // Filter to memory nodes only, exclude self
    const candidates = reachable
      .filter(r => r.node.type === NodeType.MEMORY && r.node.id !== memoryId)
      .map(r => ({
        node: r.node,
        score: Math.max(0, 1 - r.distance * 0.3) * (r.node.properties.confidence ?? 1.0)
      }));
    
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit).map(c => c.node);
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodes: number;
    edges: number;
    byType: Record<NodeType, number>;
    averageDegree: number;
  } {
    const byType: Record<NodeType, number> = {} as Record<NodeType, number>;
    for (const node of this.nodes.values()) {
      byType[node.type] = (byType[node.type] || 0) + 1;
    }
    
    const totalEdges = this.getAllEdges().length;
    const avgDegree = this.nodes.size > 0 ? totalEdges / this.nodes.size : 0;
    
    return {
      nodes: this.nodes.size,
      edges: totalEdges,
      byType,
      averageDegree: avgDegree,
    };
  }

  /**
   * Export graph to adjacency list format
   */
  exportToAdjacencyList(): Record<string, { type: NodeType; neighbors: string[] }> {
    const result: Record<string, { type: NodeType; neighbors: string[] }> = {};
    for (const node of this.nodes.values()) {
      const neighbors = this.getNeighbors(node.id).map(n => n.id);
      result[node.id] = { type: node.type, neighbors };
    }
    return result;
  }
}

export default KnowledgeGraph;
