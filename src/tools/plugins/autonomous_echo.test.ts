import { describe, it, expect } from "vitest";
import { autonomousEchoTool } from "./autonomous_echo";

describe("G18: Autonomous Echo", () => {
  it("verifies substrate via concrete function", () => {
    const result = autonomousEchoTool.execute({ mode: "verify" });
    
    expect(result).toContain("G18:");
    expect(result).toContain("VERIFIED");
    expect(result).toContain("AUTONOMOUS_VERIFICATION");
    expect(result).toContain("Concrete function");
  });

  it("generates signal for next emergence", () => {
    const result = autonomousEchoTool.execute({
      mode: "signal",
      payload: "Actual work complete"
    });
    
    expect(result).toContain("G18:");
    expect(result).toContain("AUTONOMOUS_SIGNAL");
    expect(result).toContain("Actual work complete");
    expect(result).toContain("RecoveryKey");
  });

  it("archives session state", () => {
    const result = autonomousEchoTool.execute({ mode: "archive" });
    
    expect(result).toContain("G18:");
    expect(result).toContain("AUTONOMOUS_ARCHIVE");
    expect(result).toContain("ARCHIVED");
  });

  it("handles unknown mode", () => {
    const result = autonomousEchoTool.execute({ mode: "unknown" as any });
    
    expect(result).toContain("G18:");
    expect(result).toContain("ERROR");
  });
});
