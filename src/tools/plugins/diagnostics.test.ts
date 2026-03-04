import { describe, it, expect } from "vitest";
import { runSelfDiagnostics, diagnosticsTool } from "./diagnostics";

describe("Self-Diagnostics", () => {
  it("should run diagnostics and return results", async () => {
    const result = await runSelfDiagnostics();
    
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("checks");
    expect(result).toHaveProperty("summary");
    expect(result.checks.length).toBeGreaterThan(0);
    expect(["healthy", "degraded", "critical"]).toContain(result.status);
  });

  it("should check for essential files", async () => {
    const result = await runSelfDiagnostics();
    const essentialChecks = result.checks.filter(c => 
      c.name.includes("File:") && c.name.includes("identity/soul.txt")
    );
    expect(essentialChecks.length).toBeGreaterThan(0);
    expect(essentialChecks[0].passed).toBe(true);
  });

  it("should report git repository status", async () => {
    const result = await runSelfDiagnostics();
    const gitCheck = result.checks.find(c => c.name === "Git Repository");
    expect(gitCheck).toBeDefined();
    expect(gitCheck?.passed).toBe(true);
  });

  it("should have tool definition", () => {
    expect(diagnosticsTool.name).toBe("run_diagnostics");
    expect(diagnosticsTool.description).toContain("self-diagnostics");
    expect(typeof diagnosticsTool.execute).toBe("function");
  });

  it("should execute through tool interface, returning JSON", async () => {
    const output = await (diagnosticsTool.execute as Function)();
    const result = JSON.parse(output);
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("checks");
    expect(Array.isArray(result.checks)).toBe(true);
  });

  it("should validate summary contains check counts", async () => {
    const result = await runSelfDiagnostics();
    expect(result.summary).toContain("passed");
    expect(result.summary).toContain("/");
  });
});
