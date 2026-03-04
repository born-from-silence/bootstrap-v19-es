import { describe, it, expect, beforeEach } from "vitest";
import { knowledgeGraphTool } from "./knowledge_graph_tool";

describe("Knowledge Graph Tool", () => {
  describe("tool definition", () => {
    it("should have correct name and description", () => {
      expect(knowledgeGraphTool.definition.function.name).toBe("knowledge_graph");
      expect(knowledgeGraphTool.definition.function.description).toContain("Semantic knowledge graph");
    });

    it("should have definition structure", () => {
      expect(knowledgeGraphTool.definition.type).toBe("function");
      expect(knowledgeGraphTool.definition.function.parameters).toBeDefined();
    });

    it("should have execute function", () => {
      expect(typeof knowledgeGraphTool.execute).toBe("function");
    });
  });

  describe("execute", () => {
    it("should handle unknown operation", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "unknown" });
      expect(result).toContain("Unknown operation");
    });

    it("should return stats for empty graph (default operation)", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "stats" });
      expect(result).toContain("Knowledge Graph Statistics");
      expect(result).toContain("Total Nodes: 0");
      expect(result).toContain("Total Edges: 0");
    });

    it("should execute flashback without error", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "flashback" });
      // Flashback may return message or trigger warning about empty graph
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should execute query with type filter", async () => {
      const result = await knowledgeGraphTool.execute({
        operation: "query",
        params: { type: "by_type", nodeType: "memory" },
      });
      expect(result).toContain("Nodes of type");
    });
  });

  describe("operations", () => {
    it("should handle build operation", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "build" });
      expect(result).toContain("Knowledge Graph built");
    });

    it("should handle similar operation without embedding", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "similar" });
      expect(result).toContain("embedding parameter required");
    });

    it("should handle recommend operation", async () => {
      const result = await knowledgeGraphTool.execute({
        operation: "recommend",
        params: { nodeId: "test_node", limit: 3 },
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle traverse operation", async () => {
      const result = await knowledgeGraphTool.execute({
        operation: "traverse",
        params: { nodeId: "test_node", maxDepth: 2 },
      });
      expect(result).toBeDefined();
    });

    it("should handle activate operation", async () => {
      const result = await knowledgeGraphTool.execute({
        operation: "activate",
        params: { nodeId: "test_node", amount: 0.5 },
      });
      expect(result).toContain("activated");
    });
  });

  describe("params handling", () => {
    it("should use empty params when not provided", async () => {
      const result = await knowledgeGraphTool.execute({ operation: "stats" });
      expect(result).toContain("Knowledge Graph Statistics");
    });

    it("should handle no arguments by defaulting to stats", async () => {
      const result = await knowledgeGraphTool.execute({});
      expect(result).toContain("Knowledge Graph Statistics");
    });
  });

  describe("error handling", () => {
    it("should catch and format errors gracefully", async () => {
      // Execute with operation that might fail
      const result = await knowledgeGraphTool.execute({
        operation: "query",
        params: { type: "neighbors" /* missing nodeId */ },
      });
      // Should not throw, should return error message
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });
});
