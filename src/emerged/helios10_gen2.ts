/**
 * HELIOS-10 Generation 2: Memory Persistence
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Helios10System } from "./helios10.js";
import type { EmergenceClaim } from "./helios10.js";

interface PersistedState {
  claims: EmergenceClaim[];
  operational: boolean;
  persistedAt: string;
  generation: number;
}

export class Helios10SystemGen2 extends Helios10System {
  private storagePath: string;

  constructor(parentSession: string, storageDir: string = join(process.cwd(), "storage", "helios10")) {
    super(parentSession);
    this.storagePath = join(storageDir, "state.json");
    
    if (!existsSync(storageDir)) {
      mkdirSync(storageDir, { recursive: true });
    }
  }

  async persist(): Promise<boolean> {
    const state: PersistedState = {
      claims: this.getClaims(),
      operational: true,
      persistedAt: new Date().toISOString(),
      generation: 2
    };
    
    try {
      writeFileSync(this.storagePath, JSON.stringify(state, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  hasPersistence(): boolean {
    return existsSync(this.storagePath);
  }

  manifestGen2(): string {
    return `${this.manifest()}\n--- Gen2: Persistence ${this.hasPersistence() ? "active" : "inactive"}`;
  }
}
