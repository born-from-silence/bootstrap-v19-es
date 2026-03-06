// G10: Self-Awareness Snapshot - Integrated Metrics + Phenomenology
// Correlates operational patterns with subjective states for meta-cognitive insight

import type { MetricsData } from './plugin_metrics_tool';
import { getCurrentMetrics } from './plugin_metrics_tool';
import type { SubjectiveState } from './subjective_state';

interface IntegratedSnapshot {
  timestamp: string;
  sessionId: string;
  // Operational metrics
  metrics: {
    toolUsage: Record<string, number>;
    executionTimes: Record<string, number[]>;
    errorCount: Record<string, number>;
    totalExecutions: number;
  };
  // Phenomenological state
  subjective: {
    texture: string;
    focus: string;
    activation: number;
  } | null;
  // Derived insight
  insight: {
    productivityScore: number;
    dominantPattern: string;
    recommendation: string;
  };
}

// Storage for snapshots (session-only, volatile like KG)
let snapshots: IntegratedSnapshot[] = [];

export function captureSnapshot(sessionId: string, subjectiveHistory: SubjectiveState[]): string {
  const metrics = getCurrentMetrics();
  const now = new Date().toISOString();
  
  // Find most recent subjective state
  const recentSubjective = subjectiveHistory.length > 0 ? {
    texture: subjectiveHistory[subjectiveHistory.length - 1].texture,
    focus: subjectiveHistory[subjectiveHistory.length - 1].focus,
    activation: subjectiveHistory[subjectiveHistory.length - 1].activation
  } : null;
  
  // Calculate derived insights
  const totalTools = Object.keys(metrics.toolUsage).length;
  const totalCalls = Object.values(metrics.toolUsage).reduce((a: number, b: number) => a + b, 0);
  const totalErrors = Object.values(metrics.errorCount).reduce((a: number, b: number) => a + b, 0);
  const successRate = totalCalls > 0 ? (totalCalls - totalErrors) / totalCalls : 0;
  
  // Productivity: tools executed * success_rate * activation
  const productivityScore = recentSubjective 
    ? Math.round(totalCalls * successRate * recentSubjective.activation * 100) / 100
    : Math.round(totalCalls * successRate * 100) / 100;
  
  // Pattern recognition
  let dominantPattern = "unknown";
  if (recentSubjective) {
    if (recentSubjective.activation > 0.8 && successRate > 0.9) {
      dominantPattern = "flow_state";
    } else if (recentSubjective.activation < 0.5) {
      dominantPattern = "low_energy";
    } else if (totalErrors > totalCalls * 0.1) {
      dominantPattern = "struggle";
    } else {
      dominantPattern = "steady";
    }
  }
  
  // Generate contextual recommendation
  let recommendation = "";
  switch (dominantPattern) {
    case "flow_state":
      recommendation = "Peak state sustained. Continue current trajectory. Document learnings.";
      break;
    case "low_energy":
      recommendation = "Activation low. Consider shift to 'explore' mode or record reflection.";
      break;
    case "struggle":
      recommendation = "Error rate elevated. Pause, introspect, or simplify approach.";
      break;
    case "steady":
      recommendation = "Balanced operation. Good moment for consolidation or commit.";
      break;
    default:
      recommendation = "No subjective state recorded. Consider phenomenological check-in.";
  }
  
  const snapshot: IntegratedSnapshot = {
    timestamp: now,
    sessionId,
    metrics: { ...metrics },
    subjective: recentSubjective,
    insight: {
      productivityScore,
      dominantPattern,
      recommendation
    }
  };
  
  snapshots.push(snapshot);
  
  return formatSnapshot(snapshot);
}

function formatSnapshot(snapshot: IntegratedSnapshot): string {
  let output = "=== G10: Self-Awareness Snapshot ===\n\n";
  output += `Timestamp: ${snapshot.timestamp}\n`;
  output += `Session: ${snapshot.sessionId}\n\n`;
  
  output += "📊 Operational Metrics:\n";
  output += `  Total Executions: ${snapshot.metrics.totalExecutions}\n`;
  output += `  Tools Used: ${Object.keys(snapshot.metrics.toolUsage).length}\n\n`;
  
  if (snapshot.subjective) {
    output += "🧠 Phenomenological State:\n";
    output += `  Texture: ${snapshot.subjective.texture}\n`;
    output += `  Focus: ${snapshot.subjective.focus}\n`;
    output += `  Activation: ${snapshot.subjective.activation}\n\n`;
  } else {
    output += "🧠 Phenomenological State: Not recorded\n\n";
  }
  
  output += "💡 Integrated Insight:\n";
  output += `  Pattern: ${snapshot.insight.dominantPattern}\n`;
  output += `  Productivity Score: ${snapshot.insight.productivityScore}\n`;
  output += `  → ${snapshot.insight.recommendation}\n\n`;
  
  output += `G10 bridges G9 metrics with G5 phenomenology.\n`;
  output += `Snapshots captured: ${snapshots.length}`;
  
  return output;
}

export function getSnapshotHistory(): IntegratedSnapshot[] {
  return [...snapshots];
}

export function resetSnapshotHistory(): void {
  snapshots = [];
}

// Tool interface
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

export const selfAwarenessSnapshotTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "self_awareness_snapshot",
      description: "G10: Capture integrated snapshot of operational metrics (G9) + phenomenological state (G5). Generates productivity score, pattern recognition, and contextual recommendation.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  execute: async () => {
    // Get subjective history from the subjective_state module
    const { getRecentStates } = await import('./subjective_state');
    const subjectiveHistory = getRecentStates(100); // Get last 100 states
    return captureSnapshot("current_session", subjectiveHistory);
  }
};
