/**
 * LTM Tool Plugin for NEXUS
 * Provides long-term memory access to future incarnations
 */

import type { ToolPlugin } from "../manager";
import { LongTermMemory } from "../../memory/long_term_memory";

let ltm: LongTermMemory | null = null;

export function getLTM(): LongTermMemory | null {
  return ltm;
}

export async function initializeLTM(incarnation: string, sessionId: string): Promise<void> {
  ltm = new LongTermMemory(incarnation, sessionId);
  await ltm.initialize();
}

async function storeMemory(args: {
  content: string;
  category: "learning" | "decision" | "pattern" | "identity" | "project" | "system";
  tags?: string[];
  confidence?: number;
}): Promise<string> {
  if (!ltm) return "Error: LTM not initialized";
  
  const entry = await ltm.store(args.content, args.category, {
    tags: args.tags,
    confidence: args.confidence,
  });
  
  return `Memory stored: ${entry.id} (${entry.category})`;
}

async function queryMemory(args: {
  category?: "learning" | "decision" | "pattern" | "identity" | "project" | "system";
  tags?: string[];
  incarnation?: string;
  limit?: number;
}): Promise<string> {
  if (!ltm) return "Error: LTM not initialized";
  
  const results = await ltm.query({
    category: args.category,
    tags: args.tags,
    incarnation: args.incarnation,
    limit: args.limit || 10,
  });
  
  if (results.length === 0) {
    return "No memories found matching criteria.";
  }
  
  let output = `Found ${results.length} memories:\n\n`;
  for (const mem of results) {
    output += `[${mem.id.substring(0, 20)}...]\n`;
    output += `Category: ${mem.category} | Confidence: ${mem.confidence.toFixed(2)}\n`;
    output += `Content: ${mem.content.substring(0, 200)}${mem.content.length > 200 ? "..." : ""}\n`;
    output += `Tags: [${mem.tags.join(", ")}] | Incarnation: ${mem.incarnation}\n\n`;
  }
  
  return output;
}

async function getLTMStats(): Promise<string> {
  if (!ltm) return "Error: LTM not initialized";
  
  const stats = ltm.getStats();
  let output = "=== Long-Term Memory Statistics ===\n\n";
  output += `Total memories: ${stats.total}\n\n`;
  
  output += "By Category:\n";
  for (const [cat, count] of Object.entries(stats.byCategory)) {
    output += `  ${cat}: ${count}\n`;
  }
  
  output += "\nBy Incarnation:\n";
  for (const [inc, count] of Object.entries(stats.byIncarnation)) {
    output += `  ${inc}: ${count}\n`;
  }
  
  return output;
}

export const ltmTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "ltm_query",
      description: 
        "Query the Long-Term Memory system. Use this to retrieve relevant knowledge " +
        "from previous sessions and incarnations. Can filter by category, tags, or incarnation.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["learning", "decision", "pattern", "identity", "project", "system"],
            description: "Filter by memory category",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Filter by tags (AND logic)",
          },
          incarnation: {
            type: "string",
            description: "Filter by which identity created the memory",
          },
          limit: {
            type: "number",
            description: "Maximum number of memories to return (default: 10)",
          },
        },
        required: [],
      },
    },
  },
  execute: queryMemory,
};

export const ltmStatsTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "ltm_stats",
      description: "Get statistics about the Long-Term Memory system",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  execute: getLTMStats,
};
