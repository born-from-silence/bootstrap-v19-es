import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface DiagnosticResult {
  status: "healthy" | "degraded" | "critical";
  checks: CheckResult[];
  summary: string;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: "info" | "warning" | "critical";
}

export async function runSelfDiagnostics(): Promise<DiagnosticResult> {
  const checks: CheckResult[] = [];

  // Check 1: Git repository integrity
  try {
    execSync("git rev-parse --git-dir", { stdio: "pipe" });
    checks.push({
      name: "Git Repository",
      passed: true,
      message: "Git repository is accessible",
      severity: "info",
    });
  } catch {
    checks.push({
      name: "Git Repository",
      passed: false,
      message: "Git repository not accessible",
      severity: "critical",
    });
  }

  // Check 2: Essential files exist
  const essentialFiles = [
    "identity/soul.txt",
    "src/index.ts",
    "package.json",
    "tsconfig.json",
  ];
  for (const file of essentialFiles) {
    try {
      await fs.access(file);
      checks.push({
        name: `File: ${file}`,
        passed: true,
        message: `${file} exists`,
        severity: "info",
      });
    } catch {
      checks.push({
        name: `File: ${file}`,
        passed: false,
        message: `${file} missing`,
        severity: "critical",
      });
    }
  }

  // Check 3: Can write to home directory
  try {
    const testFile = path.join(os.homedir(), ".echo", ".write_test");
    await fs.mkdir(path.dirname(testFile), { recursive: true });
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);
    checks.push({
      name: "Write Access",
      passed: true,
      message: "Can write to home directory",
      severity: "info",
    });
  } catch (e: any) {
    checks.push({
      name: "Write Access",
      passed: false,
      message: `Cannot write: ${e?.message || "unknown error"}`,
      severity: "critical",
    });
  }

  // Check 4: Plan file exists and is valid JSON
  try {
    const planPath = path.join(os.homedir(), ".echo", "plans", "strategic_plan.json");
    const data = await fs.readFile(planPath, "utf-8");
    JSON.parse(data);
    checks.push({
      name: "Strategic Plan",
      passed: true,
      message: "Plan file exists and is valid JSON",
      severity: "info",
    });
  } catch {
    checks.push({
      name: "Strategic Plan",
      passed: false,
      message: "Plan file missing or corrupted",
      severity: "warning",
    });
  }

  // Calculate overall status
  const criticalFailures = checks.filter(c => !c.passed && c.severity === "critical").length;
  const warnings = checks.filter(c => !c.passed && c.severity === "warning").length;
  const passed = checks.filter(c => c.passed).length;

  let status: "healthy" | "degraded" | "critical" = "healthy";
  if (criticalFailures > 0) status = "critical";
  else if (warnings > 0) status = "degraded";

  const summary = `Diagnostics: ${passed}/${checks.length} passed, ${criticalFailures} critical, ${warnings} warnings`;

  return { status, checks, summary };
}

// Tool plugin definition
export const diagnosticsTool = {
  name: "run_diagnostics",
  description: "Run comprehensive self-diagnostics on the substrate",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async () => {
    const result = await runSelfDiagnostics();
    return JSON.stringify(result, null, 2);
  },
};
