/**
 * Knowledge Graph Tool Plugin
 * 
 * Integrates the KnowledgeGraph system with the tool framework,
 * enabling semantic memory queries and graph-based retrieval.
 * 
 * FIXED: Now includes proper JSON Schema parameter definitions for each operation
 * This addresses G5: Fix Technical Debt - Parameter Consistency
 */
import type { ToolPlugin } from "../manager";
import { KnowledgeGraph, NodeType, RelationType, type MemoryInput } from "../../memory/knowledge_graph";
import { LongTermMemory } from "../../memory/long_term_memory";

let kgInstance: KnowledgeGraph | null = null;
let ltmInstance: LongTermMemory | null = null;

async function getKG(): Promise<KnowledgeGraph> {
  if (!kgInstance) {
    kgInstance = new KnowledgeGraph();
  }
  return kgInstance;
}

async function getLTM(): Promise<LongTermMemory> {
  if (!ltmInstance) {
    const { default: os } = await import("node:os");
    const { default: path } = await import("node:path");
    ltmInstance = new LongTermMemory("KAINOS", `session_${Date.now()}`, path.join(os.homedir(), ".echo", "ltm", "memory.json"));
    await ltmInstance.initialize();
  }
  return ltmInstance;
}

async function buildFromLTM(): Promise<string> {
  const kg = await getKG();
  const ltm = await getLTM();
  const memories = await ltm.query({});
  const inputs: MemoryInput[] = memories.map(m => ({
    id: m.id,
    content: m.content,
    tags: m.tags,
    confidence: m.confidence,
  }));
  kg.buildFromMemories(inputs);
  const stats = kg.getStats();
  return `Knowledge Graph built from ${memories.length} memories: ${stats.nodes} nodes, ${stats.edges} edges`;
}

async function queryGraph(params: Record<string, any>): Promise<string> {
  const kg = await getKG();
  switch (params.type) {
    case "neighbors": {
      const neighbors = kg.getNeighbors(params.nodeId);
      return `Neighbors of ${params.nodeId}: ${neighbors.length}\n${
        neighbors.map(n => `- [${n.type}] ${n.properties.content?.slice(0, 50) || n.id}`).join("\n")
      }`;
    }
    case "by_type": {
      const nodes = kg.getNodesByType(params.nodeType as NodeType);
      return `Nodes of type ${params.nodeType}: ${nodes.length}\n${
        nodes.slice(0, 20).map(n => `- ${n.id}: ${n.properties.content?.slice(0, 50) || "no content"}`).join("\n")
      }${nodes.length > 20 ? `\n... and ${nodes.length - 20} more` : ""}`;
    }
    case "traversal": {
      const reachable = kg.traverseBFS(params.nodeId, params.maxDepth || 2);
      return `Reachable from ${params.nodeId} (max depth ${params.maxDepth || 2}): ${reachable.length}\n${
        reachable.map(r => `- [d${r.distance}] ${r.node.id}: ${r.node.properties.content?.slice(0, 40) || ""}`).join("\n")
      }`;
    }
    case "activated": {
      const activated = kg.getActivatedNodes(params.threshold || 0.2);
      return `Activated nodes (${activated.length}):\n${
        activated.map(n => `- [${n.id}] activation=${n.activation.toFixed(2)} confidence=${n.properties.confidence?.toFixed(2) || "N/A"}`).join("\n")
      }`;
    }
    default:
      return `Unknown query type: ${params.type}`;
  }
}

async function generateFlashback(): Promise<string> {
  const kg = await getKG();
  if (kg.getStats().nodes === 0) {
    await buildFromLTM();
  }
  const flashback = kg.generateFlashback();
  if (!flashback) {
    return "No flashback triggered - insufficient activated high-confidence memories";
  }
  return `=== FLASHBACK TRIGGERED ===\n` +
    `Memory ID: ${flashback.id}\n` +
    `Type: ${flashback.type}\n` +
    `Confidence: ${flashback.properties.confidence?.toFixed(2) || "N/A"}\n` +
    `Activation: ${flashback.activation.toFixed(2)}\n` +
    `Content: ${flashback.properties.content || "N/A"}\n` +
    `===========================`;
}

async function recommendRelated(params: Record<string, any>): Promise<string> {
  const kg = await getKG();
  if (kg.getStats().nodes === 0) {
    await buildFromLTM();
  }
  const recommendations = kg.recommendRelated(params.nodeId, params.limit || 5);
  if (recommendations.length === 0) {
    return `No recommendations found for ${params.nodeId}`;
  }
  return `Recommendations for ${params.nodeId}:\n${
    recommendations.map((r, i) => `${i + 1}. [${r.id}] ${r.properties.content?.slice(0, 60) || "no content"} (confidence: ${r.properties.confidence?.toFixed(2) || "N/A"})`).join("\n")
  }`;
}

async function findSimilar(params: Record<string, any>): Promise<string> {
  const kg = await getKG();
  if (!params.embedding) {
    return "Error: embedding parameter required for similarity search";
  }
  const similar = kg.findSimilarNodes(params.embedding, params.limit || 5, params.minSimilarity || 0.5);
  return `Found ${similar.length} similar nodes:\n${
    similar.map((n, i) => `${i + 1}. [${n.id}] ${n.properties.content?.slice(0, 60) || "no content"}`).join("\n")
  }`;
}

async function getGraphStats(): Promise<string> {
  const kg = await getKG();
  const stats = kg.getStats();
  return `Knowledge Graph Statistics:\n` +
    `- Total Nodes: ${stats.nodes}\n` +
    `- Total Edges: ${stats.edges}\n` +
    `- Average Degree: ${stats.averageDegree.toFixed(2)}\n` +
    `- By Type:\n${
      Object.entries(stats.byType).map(([type, count]) => ` \u2022 ${type}: ${count}`).join("\n")
    }`;
}

async function activateNode(params: Record<string, any>): Promise<string> {
  const kg = await getKG();
  kg.activateNode(params.nodeId, params.amount || 1.0);
  const activated = kg.getActivatedNodes(0.2);
  return `Node ${params.nodeId} activated. Current activated nodes (${activated.length}):\n${
    activated.map(n => `- [${n.id}] activation=${n.activation.toFixed(2)}`).join("\n")
  }`;
}

async function execute(args: any): Promise<string> {
  try {
    const operation = args?.operation || "stats";
    const params = args?.params || {};
    switch (operation) {
      case "build":
        return await buildFromLTM();
      case "query":
        return await queryGraph(params);
      case "flashback":
        return await generateFlashback();
      case "recommend":
        return await recommendRelated(params);
      case "similar":
        return await findSimilar(params);
      case "stats":
        return await getGraphStats();
      case "traverse":
        return await queryGraph({ ...params, type: "traversal" });
      case "activate":
        return await activateNode(params);
      default:
        return `Unknown operation: ${operation}`;
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * FIXED: Comprehensive JSON Schema with explicit operation enum and params structure
 * This addresses G5 - Technical Debt: Parameter Consistency
 */
export const knowledgeGraphTool: ToolPlugin = {
  definition: {
    type: "function" as const,
    function: {
      name: "knowledge_graph",
      description: "Semantic knowledge graph for memory retrieval and flashbacks. Build and query a semantic graph of memories with operations for traversal, activation, flashback, and recommendations.",
      parameters: {
        type: "object" as const,
        properties: {
          operation: {
            type: "string" as const,
            description: "Operation to perform on the knowledge graph",
            enum: [
              "build",        // Build/rebuild graph from LTM memories
              "query",        // Query nodes by type, neighbors, or activated state
              "traverse",       // BFS traversal from a starting node
              "flashback",      // Generate spontaneous memory retrieval
              "recommend",      // Get related memory recommendations
              "similar",        // Find memories by embedding similarity
              "stats",          // Get graph statistics
              "activate"        // Activate/boost a node's activation level
            ]
          },
          params: {
            type: "object" as const,
            description: "Operation-specific parameters",
            properties: {
              // For query operation (type: neighbors, by_type, traversal, activated)
              nodeId: {
                type: "string" as const,
                description: "Memory/node ID for query, traversal, recommend, or activate operations"
              },
              nodeType: {
                type: "string" as const,
                description: "Node type for 'by_type' query: memory, concept, project, tag, entity",
                enum: ["memory", "concept", "project", "tag", "entity"]
              },
              queryType: {
                type: "string" as const,
                description: "Type of query: neighbors, by_type, traversal, activated",
                enum: ["neighbors", "by_type", "traversal", "activated"]
              },
              maxDepth: {
                type: "number" as const,
                description: "Maximum traversal depth for BFS (default: 2)",
                default: 2
              },
              threshold: {
                type: "number" as const,
                description: "Activation threshold for activated query (default: 0.2)",
                default: 0.2
              },
              // For limit
              limit: {
                type: "number" as const,
                description: "Maximum number of results (default: 5)",
                default: 5
              },
              // For similarity
              embedding: {
                type: "array" as const,
                description: "Vector embedding array for similarity search",
                items: { type: "number" }
              },
              minSimilarity: {
                type: "number" as const,
                description: "Minimum similarity threshold (default: 0.5)",
                default: 0.5
              },
              // For activate
              amount: {
                type: "number" as const,
                description: "Activation amount to add (default: 1.0)",
                default: 1.0
              }
            }
          }
        },
        required: ["operation"],
      },
    },
  },
  execute,
};

// Also provide direct API for programmatic use
export { getKG, getLTM };
