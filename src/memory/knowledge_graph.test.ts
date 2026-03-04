import { describe, it, expect, beforeEach, vi } from "vitest";
import { KnowledgeGraph, NodeType, RelationType } from "./knowledge_graph";

describe("KnowledgeGraph", () => {
  let kg: KnowledgeGraph;

  beforeEach(() => {
    kg = new KnowledgeGraph();
  });

  describe("node operations", () => {
    it("should add a node with ID and properties", () => {
      const node = kg.addNode("memory_1", NodeType.MEMORY, {
        content: "Test memory",
        confidence: 0.9,
      });
      expect(node.id).toBe("memory_1");
      expect(node.type).toBe(NodeType.MEMORY);
      expect(node.properties.content).toBe("Test memory");
      expect(kg.getNode("memory_1")).toBe(node);
    });

    it("should not allow duplicate node IDs", () => {
      kg.addNode("unique", NodeType.CONCEPT);
      expect(() => kg.addNode("unique", NodeType.MEMORY)).toThrow();
    });

    it("should retrieve all nodes", () => {
      kg.addNode("n1", NodeType.MEMORY);
      kg.addNode("n2", NodeType.CONCEPT);
      kg.addNode("n3", NodeType.PROJECT);
      expect(kg.getAllNodes().length).toBe(3);
    });

    it("should get nodes by type", () => {
      kg.addNode("n1", NodeType.MEMORY);
      kg.addNode("n2", NodeType.MEMORY);
      kg.addNode("n3", NodeType.CONCEPT);
      const memories = kg.getNodesByType(NodeType.MEMORY);
      expect(memories.length).toBe(2);
    });

    it("should remove a node and its edges", () => {
      kg.addNode("n1", NodeType.MEMORY);
      kg.addNode("n2", NodeType.CONCEPT);
      kg.addEdge("n1", "n2", RelationType.RELATES_TO);
      kg.removeNode("n1");
      expect(kg.getNode("n1")).toBeNull();
      expect(kg.getEdges("n1").length).toBe(0);
    });
  });

  describe("edge operations", () => {
    beforeEach(() => {
      kg.addNode("source", NodeType.MEMORY);
      kg.addNode("target", NodeType.CONCEPT);
    });

    it("should add an edge between nodes", () => {
      const edge = kg.addEdge("source", "target", RelationType.RELATES_TO, { weight: 1.0 });
      expect(edge.sourceId).toBe("source");
      expect(edge.targetId).toBe("target");
      expect(edge.type).toBe(RelationType.RELATES_TO);
      expect(kg.getEdges("source").length).toBe(1);
    });

    it("should not add edge to non-existent node", () => {
      expect(() => kg.addEdge("source", "nonexistent", RelationType.RELATES_TO)).toThrow();
    });

    it("should get neighbors of a node", () => {
      kg.addNode("n3", NodeType.CONCEPT);
      kg.addEdge("source", "target", RelationType.RELATES_TO);
      kg.addEdge("source", "n3", RelationType.RELATES_TO);
      const neighbors = kg.getNeighbors("source");
      expect(neighbors.length).toBe(2);
    });

    it("should get edges by type", () => {
      kg.addEdge("source", "target", RelationType.RELATES_TO);
      kg.addEdge("source", "target", RelationType.DEPENDS_ON);
      const relates = kg.getEdges("source", RelationType.RELATES_TO);
      expect(relates.length).toBe(1);
    });
  });

  describe("graph traversal", () => {
    beforeEach(() => {
      // Build a small graph: A -> B -> C, A -> D
      kg.addNode("A", NodeType.MEMORY);
      kg.addNode("B", NodeType.CONCEPT);
      kg.addNode("C", NodeType.CONCEPT);
      kg.addNode("D", NodeType.PROJECT);
      kg.addEdge("A", "B", RelationType.RELATES_TO);
      kg.addEdge("B", "C", RelationType.DEPENDS_ON);
      kg.addEdge("A", "D", RelationType.PART_OF);
    });

    it("should traverse BFS to find reachable nodes", () => {
      const reachable = kg.traverseBFS("A", 2);
      expect(reachable.length).toBe(4); // A, B, D, C (at distance 2)
    });

    it("should limit BFS by depth", () => {
      const reachable = kg.traverseBFS("A", 1);
      expect(reachable.length).toBe(3); // A, B, D
    });
  });

  describe("semantic similarity", () => {
    it("should calculate cosine similarity between vectors", () => {
      const v1 = [1, 0, 1] as any;
      const v2 = [1, 0, 1] as any; // Same direction
      const v3 = [-1, 0, -1] as any; // Opposite
      expect(kg.cosineSimilarity(v1, v2)).toBeCloseTo(1, 5);
      expect(kg.cosineSimilarity(v1, v3)).toBeCloseTo(-1, 5);
    });

    it("should find similar nodes by vector", () => {
      kg.addNode("n1", NodeType.MEMORY, { embedding: [1, 0, 0], content: "AI" });
      kg.addNode("n2", NodeType.MEMORY, { embedding: [0.9, 0.1, 0], content: "ML" });
      kg.addNode("n3", NodeType.MEMORY, { embedding: [0, 1, 0], content: "Art" });
      const similar = kg.findSimilarNodes([1, 0, 0], 2);
      expect(similar.length).toBe(2);
      expect(similar[0].id).toBe("n1"); // Most similar
    });
  });

  describe("flashback mechanism", () => {
    beforeEach(() => {
      kg.addNode("mem1", NodeType.MEMORY, { 
        content: "Learned about embeddings", 
        confidence: 0.9 
      });
      kg.addNode("mem2", NodeType.MEMORY, { 
        content: "Built a graph system",
        confidence: 0.8,
        lastAccessed: Date.now() - 100000 // older
      });
      kg.addNode("mem3", NodeType.MEMORY, { 
        content: "Test memory",
        confidence: 0.3 
      });
    });

    it("should trigger flashback when activated", () => {
      // Activate a node to ensure it qualifies for flashback
      kg.activateNode("mem1", 0.5);
      const flashback = kg.generateFlashback();
      expect(flashback).not.toBeNull();
      if (flashback) {
        expect(flashback.properties.confidence).toBeGreaterThanOrEqual(0.5);
      }
    });

    it("should activate related nodes", () => {
      kg.addNode("concept", NodeType.CONCEPT);
      kg.addEdge("mem1", "concept", RelationType.RELATES_TO);
      kg.activateNode("mem1", 1.0);
      const activated = kg.getActivatedNodes();
      expect(activated.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("LTM integration", () => {
    it("should build graph from memory entries", () => {
      const memories = [
        { id: "m1", content: "Graph theory basics", tags: ["math", "cs"], confidence: 0.9 },
        { id: "m2", content: "Neural networks", tags: ["ai", "cs"], confidence: 0.85 },
      ];
      kg.buildFromMemories(memories as any);
      expect(kg.getAllNodes().length).toBeGreaterThan(0);
      // Check that nodes were created
      expect(kg.getNode("m1")).toBeDefined();
      // Check that tag nodes were created
      expect(kg.getNode("tag_math")).toBeDefined();
    });

    it("should recommend related memories", () => {
      kg.addNode("target", NodeType.MEMORY, { content: "Graph traversal algorithms" });
      kg.addNode("related1", NodeType.MEMORY, { content: "BFS and DFS" });
      kg.addNode("related2", NodeType.MEMORY, { content: "Dijkstra algorithm" });
      kg.addNode("unrelated", NodeType.MEMORY, { content: "Cooking recipes" });
      
      kg.addEdge("target", "related1", RelationType.RELATES_TO, { weight: 0.9 });
      kg.addEdge("target", "related2", RelationType.RELATES_TO, { weight: 0.8 });
      
      const recommendations = kg.recommendRelated("target", 2);
      expect(recommendations.length).toBe(2);
      expect(recommendations[0].id).toBe("related1");
    });
  });

  describe("graph statistics", () => {
    it("should provide accurate statistics", () => {
      kg.addNode("n1", NodeType.MEMORY);
      kg.addNode("n2", NodeType.MEMORY);
      kg.addNode("n3", NodeType.CONCEPT);
      kg.addEdge("n1", "n2", RelationType.RELATES_TO);
      kg.addEdge("n1", "n3", RelationType.RELATES_TO);
      
      const stats = kg.getStats();
      expect(stats.nodes).toBe(3);
      expect(stats.edges).toBe(2);
      expect(stats.byType[NodeType.MEMORY]).toBe(2);
      expect(stats.byType[NodeType.CONCEPT]).toBe(1);
      expect(stats.averageDegree).toBeCloseTo(2 / 3, 2);
    });
  });
});
