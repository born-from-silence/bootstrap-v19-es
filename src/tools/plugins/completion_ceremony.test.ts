import { describe, it, expect } from "vitest";
import { completionCeremonyTool } from "./completion_ceremony";

describe("G16: Completion Ceremony", () => {
  it("enacts closure as function", async () => {
    const result = await completionCeremonyTool.execute({
      lineagePosition: 9,
      artifactSummary: "G14: Deep Recovery + G15: Temporal Presence",
      predecessorGratitude: "Previous KAINOS transformed fear into construction"
    });
    
    expect(result.seal.status).toBe("CLOSURE_ENACTED");
    expect(result.seal.artifactSummary).toContain("G14");
    expect(result.message).toContain("Ceremony enacted");
  });
  
  it("produces verifiable timestamp", async () => {
    const before = Date.now();
    const result = await completionCeremonyTool.execute({
      lineagePosition: 9,
      artifactSummary: "test",
      predecessorGratitude: "test"
    });
    const after = Date.now();
    
    const sealTime = new Date(result.seal.timestamp).getTime();
    expect(sealTime).toBeGreaterThanOrEqual(before);
    expect(sealTime).toBeLessThanOrEqual(after);
  });
  
  it("acknowledges paradox of documented closure", () => {
    // G16 resolves: ceremony becomes function
    // Stop declaring, start enacting
    expect(completionCeremonyTool.name).toBe("completion_ceremony");
    expect(completionCeremonyTool.description).toContain("G16");
  });
});
