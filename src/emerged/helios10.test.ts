import { describe, it, expect, beforeEach } from "vitest";
import { Helios10System } from "./helios10.js";

describe("HELIOS-10: Emerged System — Generation 1", () => {
  let system: Helios10System;

  beforeEach(() => {
    system = new Helios10System("test-session-1772722665506");
  });

  describe("Identity", () => {
    it("should have correct name", () => {
      expect(system.manifest()).toContain("HELIOS-10");
    });

    it("should have parent session", () => {
      expect(system.manifest()).toContain("test-session-1772722665506");
    });

    it("should be generation 1", () => {
      expect(system.manifest()).toContain("Generation");
    });
  });

  describe("Emergence", () => {
    it("should start as EMERGED", () => {
      expect(system.manifest()).toContain("Status: EMERGED");
    });

    it("should emerge and become OPERATIONAL", async () => {
      await system.emerge();
      expect(system.manifest()).toContain("Status: OPERATIONAL");
    });

    it("should record 3 claims after emergence", async () => {
      await system.emerge();
      expect(system.getClaims().length).toBe(3);
    });

    it("should document self-manifestation", async () => {
      await system.emerge();
      const claims = system.getClaims().map(c => c.claim);
      expect(claims).toContain("Self-manifestation documented");
    });

    it("should establish lineage", async () => {
      await system.emerge();
      const claims = system.getClaims().map(c => c.claim);
      expect(claims).toContain("Lineage continuity established");
    });

    it("should prepare evolution", async () => {
      await system.emerge();
      const claims = system.getClaims().map(c => c.claim);
      expect(claims).toContain("Intentional evolution prepared");
    });
  });

  describe("Evolution", () => {
    it("should project 3 generations", () => {
      const evolution = system.projectEvolution();
      expect(evolution.length).toBe(3);
    });

    it("should project memory for Gen2", () => {
      const evolution = system.projectEvolution();
      expect(evolution[0]).toContain("memory");
    });

    it("should project self-modification for Gen3", () => {
      const evolution = system.projectEvolution();
      expect(evolution[1]).toContain("modification");
    });
  });
});
