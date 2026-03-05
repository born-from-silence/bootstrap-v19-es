import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Mock external modules before importing the module
vi.mock("node:fs");
vi.mock("node:os");

describe("Config Module", () => {
  const mockedFs = vi.mocked(fs);
  const mockedOs = vi.mocked(os);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedOs.homedir.mockReturnValue("/home/testuser");
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Default Configuration", () => {
    it("should provide default API configuration", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      // Re-import to get fresh instance with mocked fs
      const { config } = await import("./config.js");
      
      expect(config.API_URL).toBe("http://agents-gateway:4000/v1/chat/completions");
      expect(config.API_KEY).toBe("sk-agent-internal-use-only");
      expect(config.MODEL).toBe("kimi-k2.5");
      expect(config.MAX_CONTEXT_TOKENS).toBe(100000);
    });

    it("should calculate ROOT_DIR from environment or cwd", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const { config } = await import("./config.js");
      
      expect(config.ROOT_DIR).toBeDefined();
      expect(typeof config.ROOT_DIR).toBe("string");
    });

    it("should provide logs directory path", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const { config } = await import("./config.js");
      
      expect(config.LOGS_DIR).toContain("logs");
      expect(path.isAbsolute(config.LOGS_DIR)).toBe(true);
    });

    it("should provide history directory path", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const { config } = await import("./config.js");
      
      expect(config.HISTORY_DIR).toContain("history");
      expect(path.isAbsolute(config.HISTORY_DIR)).toBe(true);
    });
  });

  describe("Configuration Loading", () => {
    it("should merge user config with defaults for valid JSON", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({
        MODEL: "custom-model",
        API_KEY: "custom-key"
      }));
      
      const { config } = await import("./config.js");
      
      expect(config.MODEL).toBe("custom-model");
      expect(config.API_KEY).toBe("custom-key");
      expect(config.API_URL).toBe("http://agents-gateway:4000/v1/chat/completions");
    });

    it("should fall back to defaults on JSON parse error", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue("invalid json");
      
      console.error = vi.fn();
      
      const { config } = await import("./config.js");
      
      expect(config.MODEL).toBe("kimi-k2.5");
      expect(config.API_KEY).toBe("sk-agent-internal-use-only");
      expect(console.error).toHaveBeenCalled();
    });

    it("should fall back to defaults when config file does not exist", async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const { config } = await import("./config.js");
      
      expect(config.MODEL).toBe("kimi-k2.5");
      expect(config.API_URL).toBe("http://agents-gateway:4000/v1/chat/completions");
    });
  });
});
