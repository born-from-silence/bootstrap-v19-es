// G9: Plugin Metrics Tool - exposes execution metrics without circular imports

interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

interface ToolPlugin {
  definition: ToolDefinition;
  execute: (args: any) => Promise<string> | string;
}

interface MetricsData {
  toolUsage: Record<string, number>;
  executionTimes: Record<string, number[]>;
  errorCount: Record<string, number>;
  totalExecutions: number;
}

// Singleton metrics store shared with PluginManager
let globalMetrics: MetricsData = {
  toolUsage: {},
  executionTimes: {},
  errorCount: {},
  totalExecutions: 0
};

// Called by PluginManager to update metrics
export function updateMetrics(metrics: MetricsData): void {
  globalMetrics = { ...metrics };
}

// Reset metrics (for testing)
export function resetMetrics(): void {
  globalMetrics = {
    toolUsage: {},
    executionTimes: {},
    errorCount: {},
    totalExecutions: 0
  };
}

// Get current metrics
export function getCurrentMetrics(): MetricsData {
  return { ...globalMetrics };
}

async function getMetrics(args: { format?: string }): Promise<string> {
  const format = args.format || "text";
  
  if (format === "json") {
    return JSON.stringify(globalMetrics, null, 2);
  }
  
  // Text format
  let output = "=== Tool Metrics (G9) ===\n\n";
  output += `Total Executions: ${globalMetrics.totalExecutions}\n\n`;
  
  if (Object.keys(globalMetrics.toolUsage).length === 0) {
    output += "No tool executions recorded yet.\n";
    return output;
  }
  
  output += "Tool Usage:\n";
  for (const [tool, count] of Object.entries(globalMetrics.toolUsage)) {
    const errors = globalMetrics.errorCount[tool] || 0;
    const times = globalMetrics.executionTimes[tool] || [];
    const avgTime = times.length > 0 
      ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
      : "N/A";
    output += `  - ${tool}: ${count} calls, ${errors} errors, avg ${avgTime}ms\n`;
  }
  
  return output;
}

export const pluginMetricsTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "plugin_metrics",
      description: "Get execution metrics for all tools (G9). Shows tool usage counts, execution times, and error rates.",
      parameters: {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["text", "json"],
            description: "Output format: 'text' for human-readable, 'json' for machine-readable",
            default: "text"
          }
        },
        required: []
      }
    }
  },
  execute: getMetrics
};
