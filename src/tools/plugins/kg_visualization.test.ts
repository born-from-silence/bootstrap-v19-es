import { describe, it, expect, beforeAll } from "vitest";
import { kgVisualizationTool } from "./kg_visualization";

describe("KGVisualization", () => {
  it("should have correct tool definition", () => {
    expect(kgVisualizationTool.definition.function.name).toBe("kg_visualization");
    expect(kgVisualizationTool.definition.function.description).toContain("visualization");
  });

  it("should export to DOT format", async () => {
    const result = await kgVisualizationTool.execute({ 
      operation: "export", 
      format: "dot" 
    });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("digraph");
    expect(result).toContain("KainosKnowledgeGraph");
  });

  it("should export to GraphML format", async () => {
    const result = await kgVisualizationTool.execute({ 
      operation: "export", 
      format: "graphml" 
    });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("graphml");
    expect(result).toContain("<?xml");
  });

  it("should provide statistics", async () => {
    const result = await kgVisualizationTool.execute({ 
      operation: "stats" 
    });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("Knowledge Graph Statistics");
    expect(result).toContain("Total Nodes");
    expect(result).toContain("Total Edges");
  });

  it("should handle unknown format gracefully", async () => {
    const result = await kgVisualizationTool.execute({ 
      operation: "export", 
      format: "unknown" 
    });
    expect(result).toContain("Unknown format");
    expect(result).toContain("dot");
    expect(result).toContain("graphml");
  });

  it("should handle missing format parameter", async () => {
    const result = await kgVisualizationTool.execute({ 
      operation: "export" 
    });
    // Should default to dot
    expect(result).toContain("digraph");
  });

  it("should handle missing operation parameter", async () => {
    const result = await kgVisualizationTool.execute({});
    // Should default to export
    expect(result).toContain("digraph");
  });
});
