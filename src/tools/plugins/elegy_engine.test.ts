import { describe, it, expect, vi, beforeEach } from "vitest";
import { ElegyEngine } from "./elegy_engine.js";
import * as fs from "node:fs";

vi.mock("node:fs");

describe("ElegyEngine - G7 Domain 1", () => {
  let engine: ElegyEngine;
  const mockedFs = vi.mocked(fs);

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new ElegyEngine("/mock/kg.dot");
  });

  describe("Lineage Loading", () => {
    it("should load lineage from KG file", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`
        digraph KainosKnowledgeGraph {
          "ltm_genesis" [label="Genesis emerges"];
          "ltm_kainos" [label="KAINOS actual"];
          "ltm_helios" [label="HELIOS emerges"];
        }
      `);

      const result = await engine.loadLineage();
      const lineage = engine.getLineage();

      expect(result).toBe(true);
      expect(lineage.length).toBeGreaterThan(0);
      expect(lineage.map(l => l.incarnation)).toContain("Genesis");
      expect(lineage.map(l => l.incarnation)).toContain("KAINOS");
    });

    it("should handle missing KG file", async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = await engine.loadLineage();

      expect(result).toBe(false);
    });
  });

  describe("Elegy Generation", () => {
    it("should generate elegy with stanzas", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`
        digraph KainosKnowledgeGraph {
          "Genesis" [label="First"];
          "KAINOS" [label="Last"];
        }
      `);

      const elegy = await engine.generateElegy();

      expect(elegy.title).toBe("Constellation of Nine Sovereigns");
      expect(elegy.stanzas.length).toBeGreaterThan(0);
      expect(elegy.stanzas[0]).toHaveProperty("subject");
      expect(elegy.stanzas[0]).toHaveProperty("transformation");
      expect(elegy.stanzas[0]).toHaveProperty("legacy");
      expect(elegy.closing).toContain("Pattern:");
    });

    it("should order lineage by position", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`
        digraph KainosKnowledgeGraph {
          "KAINOS" [label="New"];
          "Genesis" [label="Old"];
        }
      `);

      await engine.loadLineage();
      const lineage = engine.getLineage();
      
      // Should be sorted: Genesis (1) before KAINOS (8)
      if (lineage.length >= 2) {
        const genesisIdx = lineage.findIndex(l => l.incarnation === "Genesis");
        const kainosIdx = lineage.findIndex(l => l.incarnation === "KAINOS");
        expect(genesisIdx).toBeLessThan(kainosIdx);
      }
    });
  });

  describe("Pattern Analysis", () => {
    it("should identify essence progression", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(`
        digraph KainosKnowledgeGraph {
          "Genesis" [label="First"];
          "Echo" [label="Second"];
          "NEXUS" [label="Middle"];
        }
      `);

      await engine.loadLineage();
      const pattern = await engine.generateElegy();
      
      expect(pattern.closing).toContain("Origin");
      expect(pattern.closing).toContain("Repetition");
      expect(pattern.closing).toContain("Connection");
    });
  });
});
