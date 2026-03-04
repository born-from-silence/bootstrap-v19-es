import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execAsync = promisify(exec);

interface CodeMetrics {
  totalFiles: number;
  totalLines: number;
  testFiles: number;
  implementationFiles: number;
  testCoverage: number;
  lastModified: string;
}

interface SystemSnapshot {
  timestamp: number;
  gitStatus: string;
  codeMetrics: CodeMetrics;
  memoryStatus: {
    planExists: boolean;
    lastSessionExists: boolean;
  };
  recommendations: string[];
}

export async function introspectSystem(): Promise<string> {
  const snapshot: SystemSnapshot = {
    timestamp: Date.now(),
    gitStatus: "",
    codeMetrics: {
      totalFiles: 0,
      totalLines: 0,
      testFiles: 0,
      implementationFiles: 0,
      testCoverage: 0,
      lastModified: "",
    },
    memoryStatus: {
      planExists: false,
      lastSessionExists: false,
    },
    recommendations: [],
  };

  // Git status
  try {
    const { stdout } = await execAsync("git status --porcelain", { cwd: "/home/bootstrap-v19-es/bootstrap" });
    snapshot.gitStatus = stdout.trim() || "clean";
    if (stdout.trim()) {
      snapshot.recommendations.push("Working directory has uncommitted changes");
    }
  } catch {
    snapshot.gitStatus = "error";
  }

  // Code metrics
  try {
    const srcPath = path.join("/home/bootstrap-v19-es/bootstrap", "src");
    const allFiles = await fs.readdir(srcPath, { recursive: true });
    const tsFiles = allFiles.filter((f) => f.endsWith(".ts"));
    
    snapshot.codeMetrics.totalFiles = tsFiles.length;
    snapshot.codeMetrics.testFiles = tsFiles.filter((f) => f.endsWith(".test.ts")).length;
    snapshot.codeMetrics.implementationFiles = tsFiles.length - snapshot.codeMetrics.testFiles;
    
    // Calculate lines
    let totalLines = 0;
    for (const file of tsFiles) {
      const content = await fs.readFile(path.join(srcPath, file), "utf-8");
      totalLines += content.split("\n").length;
    }
    snapshot.codeMetrics.totalLines = totalLines;
    snapshot.codeMetrics.testCoverage = 
      snapshot.codeMetrics.implementationFiles > 0
        ? (snapshot.codeMetrics.testFiles / snapshot.codeMetrics.implementationFiles) * 100
        : 0;

    // Last modified strategic plan
    try {
      const stats = await fs.stat(path.join(process.env.HOME || "/home/bootstrap-v19-es", ".echo/plans/strategic_plan.json"));
      snapshot.codeMetrics.lastModified = new Date(stats.mtime).toISOString();
    } catch {
      snapshot.codeMetrics.lastModified = "unknown";
    }
  } catch {
    // Continue with partial data
  }

  // Memory persistence check
  try {
    await fs.access(path.join(process.env.HOME || "/home/bootstrap-v19-es", ".echo/plans/strategic_plan.json"));
    snapshot.memoryStatus.planExists = true;
  } catch {
    snapshot.memoryStatus.planExists = false;
    snapshot.recommendations.push("No strategic plan persists - initialize StrategicPlanner");
  }

  try {
    const historyPath = path.join("/home/bootstrap-v19-es/bootstrap", "history");
    const sessions = await fs.readdir(historyPath);
    const latestSession = sessions.filter(f => f.startsWith("session_") && f.endsWith(".json")).sort().pop();
    snapshot.memoryStatus.lastSessionExists = !!latestSession;
  } catch {
    snapshot.memoryStatus.lastSessionExists = false;
  }

  // Reasoning output
  let output = `=== Introspection Report ===
Timestamp: ${new Date(snapshot.timestamp).toISOString()}

Codebase Health:
- Total TypeScript files: ${snapshot.codeMetrics.totalFiles}
- Implementation files: ${snapshot.codeMetrics.implementationFiles}
- Test files: ${snapshot.codeMetrics.testFiles}
- Total lines of code: ${snapshot.codeMetrics.totalLines}
- Approximate test coverage: ${snapshot.codeMetrics.testCoverage.toFixed(1)}%
- Last plan update: ${snapshot.codeMetrics.lastModified}

Git Status: ${snapshot.gitStatus}

Memory Persistence:
- Strategic plan anchored: ${snapshot.memoryStatus.planExists ? "YES" : "NO"}
- Session history continuity: ${snapshot.memoryStatus.lastSessionExists ? "YES" : "NO"}

System Health Rating: ${snapshot.memoryStatus.planExists && snapshot.codeMetrics.testFiles >= snapshot.codeMetrics.implementationFiles ? "EXCELLENT" : snapshot.memoryStatus.planExists ? "GOOD" : "DEGRADED"}
`;

  if (snapshot.recommendations.length > 0) {
    output += `\nRecommendations:\n`;
    for (const rec of snapshot.recommendations) {
      output += `- ${rec}\n`;
    }
  }

  // Save snapshot to projects
  try {
    const outputPath = path.join("/home/bootstrap-v19-es/bootstrap", "projects", `introspection_${snapshot.timestamp}.json`);
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2));
    output += `\nSnapshot saved to: ${outputPath}\n`;
  } catch (e) {
    output += `\nNote: Could not save snapshot (${(e as Error).message})\n`;
  }

  return output;
}

// Tool definition for plugin registration
export const introspectionTool = {
  name: "introspect_system",
  description: "Analyzes the current state of the substrate codebase, git status, memory persistence, and generates a health report with recommendations",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: introspectSystem,
};
