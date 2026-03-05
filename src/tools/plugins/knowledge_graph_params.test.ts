import { describe, it, expect } from "vitest";
import { knowledgeGraphTool } from "./knowledge_graph_tool";

// Type assertion helpers
interface ToolParameters {
  properties: {
    operation: {
      type: string;
      enum: string[];
      description: string;
    };
    params: {
      type: string;
      properties: {
        nodeId: {
          type: string;
          description: string;
        };
        nodeType: {
          type: string;
          enum: string[];
          description: string;
        };
        limit: {
          type: string;
        };
        threshold: {
          type: string;
        };
        maxDepth: {
          type: string;
        };
      };
      description: string;
    };
  };
  required: string[];
}

describe("Knowledge Graph Tool - G5 Parameter Schema Fix", () => {
  describe("tool definition structure", () => {
    it("should have operation field with explicit enum", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const operationProp = params.properties.operation;
      
      expect(operationProp).toBeDefined();
      expect(operationProp.type).toBe("string");
      expect(operationProp.enum).toBeDefined();
      expect(operationProp.enum).toHaveLength(8);
      expect(operationProp.enum).toContain("build");
      expect(operationProp.enum).toContain("query");
      expect(operationProp.enum).toContain("flashback");
      expect(operationProp.enum).toContain("recommend");
      expect(operationProp.enum).toContain("similar");
      expect(operationProp.enum).toContain("stats");
      expect(operationProp.enum).toContain("traverse");
      expect(operationProp.enum).toContain("activate");
    });

    it("should have params as object type with defined properties", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const paramsProp = params.properties.params;
      
      expect(paramsProp).toBeDefined();
      expect(paramsProp.type).toBe("object");
    });

    it("should define nodeId parameter for operations that need it", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const innerProps = params.properties.params.properties;
      
      expect(innerProps.nodeId).toBeDefined();
      expect(innerProps.nodeId.type).toBe("string");
      expect(innerProps.nodeId.description).toContain("query");
    });

    it("should define nodeType enum for by_type queries", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const innerProps = params.properties.params.properties;
      
      expect(innerProps.nodeType).toBeDefined();
      expect(innerProps.nodeType.enum).toContain("memory");
      expect(innerProps.nodeType.enum).toContain("tag");
      expect(innerProps.nodeType.enum).toContain("concept");
    });

    it("should define limit with proper type", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const innerProps = params.properties.params.properties;
      
      expect(innerProps.limit).toBeDefined();
      expect(innerProps.limit.type).toBe("number");
    });

    it("should define threshold for activation queries", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const innerProps = params.properties.params.properties;
      
      expect(innerProps.threshold).toBeDefined();
      expect(innerProps.threshold.type).toBe("number");
    });

    it("should define maxDepth for traversal", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      const innerProps = params.properties.params.properties;
      
      expect(innerProps.maxDepth).toBeDefined();
      expect(innerProps.maxDepth.type).toBe("number");
    });

    it("operation should be required", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      expect(params.required).toContain("operation");
    });

    it("should describe what the tool does", () => {
      const desc = knowledgeGraphTool.definition.function.description;
      expect(desc).toContain("knowledge graph");
      expect(desc.toLowerCase()).toContain("memory");
    });
  });

  describe("parameter descriptions", () => {
    it("should have descriptions for all param types", () => {
      const params = knowledgeGraphTool.definition.function.parameters as ToolParameters;
      expect(params.properties.params.description).toBeTruthy();
    });
  });
});
