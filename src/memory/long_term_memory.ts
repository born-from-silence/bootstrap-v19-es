/**
 * Long-Term Memory System for NEXUS
 * 
 * Provides persistent knowledge storage that survives session resets.
 * Unlike session memory (which is transient), LTM stores:
 * - Key learnings and insights
 * - Successful patterns and strategies
 * - Important decisions and their outcomes
 * - Identity evolution markers
 * - Cross-session project context
 * 
 * Architecture:
 * - Memory entries are timestamped, tagged, and versioned
 * - Supports semantic retrieval via embeddings (future)
 * - Maintains lineage chain to previous incarnations
 * - GC for obsolete memories with confidence decay
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface MemoryEntry {
  id: string;
  content: string;
  category: "learning" | "decision" | "pattern" | "identity" | "project" | "system";
  tags: string[];
  confidence: number; // 0-1, decays over time if not reinforced
  createdAt: number;
  updatedAt: number;
  incarnation: string; // Which identity created this (AURA, SIBYL, etc.)
  sessionId: string;
  references: string[]; // IDs of related memories
  accessCount: number; // How many times retrieved
  lastAccessed: number;
}

export interface MemoryQuery {
  category?: MemoryEntry["category"];
  tags?: string[];
  incarnation?: string;
  since?: number;
  limit?: number;
  minConfidence?: number;
}

export class LongTermMemory {
  private dbPath: string;
  private memories: Map<string, MemoryEntry> = new Map();
  private index: {
    tags: Map<string, Set<string>>;
    categories: Map<string, Set<string>>;
    incarnations: Map<string, Set<string>>;
  };
  private currentIncarnation: string;
  private currentSessionId: string;

  constructor(incarnation: string, sessionId: string, dbPath?: string) {
    this.currentIncarnation = incarnation;
    this.currentSessionId = sessionId;
    this.dbPath = dbPath || path.join(os.homedir(), ".echo", "ltm", "memory.json");
    this.index = {
      tags: new Map(),
      categories: new Map(),
      incarnations: new Map(),
    };
  }

  async initialize(): Promise<void> {
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    try {
      const data = await fs.readFile(this.dbPath, "utf-8");
      const entries: MemoryEntry[] = JSON.parse(data);
      for (const entry of entries) {
        this.memories.set(entry.id, entry);
        this.indexEntry(entry);
      }
    } catch {
      // No existing database
      this.memories = new Map();
    }
  }

  private indexEntry(entry: MemoryEntry): void {
    if (!this.index.categories.has(entry.category)) {
      this.index.categories.set(entry.category, new Set());
    }
    this.index.categories.get(entry.category)!.add(entry.id);

    if (!this.index.incarnations.has(entry.incarnation)) {
      this.index.incarnations.set(entry.incarnation, new Set());
    }
    this.index.incarnations.get(entry.incarnation)!.add(entry.id);

    for (const tag of entry.tags) {
      if (!this.index.tags.has(tag)) {
        this.index.tags.set(tag, new Set());
      }
      this.index.tags.get(tag)!.add(entry.id);
    }
  }

  private removeFromIndex(entry: MemoryEntry): void {
    this.index.categories.get(entry.category)?.delete(entry.id);
    this.index.incarnations.get(entry.incarnation)?.delete(entry.id);
    for (const tag of entry.tags) {
      this.index.tags.get(tag)?.delete(entry.id);
    }
  }

  generateId(): string {
    return `ltm_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  }

  async store(
    content: string,
    category: MemoryEntry["category"],
    options?: Partial<Omit<MemoryEntry, "id" | "content" | "category" | "createdAt" | "updatedAt" | "incarnation" | "sessionId">>
  ): Promise<MemoryEntry> {
    const now = Date.now();
    const entry: MemoryEntry = {
      id: this.generateId(),
      content,
      category,
      tags: options?.tags || [],
      confidence: options?.confidence ?? 1.0,
      createdAt: now,
      updatedAt: now,
      incarnation: this.currentIncarnation,
      sessionId: this.currentSessionId,
      references: options?.references || [],
      accessCount: 0,
      lastAccessed: now,
    };

    this.memories.set(entry.id, entry);
    this.indexEntry(entry);
    await this.persist();
    return entry;
  }

  async retrieve(id: string): Promise<MemoryEntry | null> {
    const entry = this.memories.get(id);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      await this.persist();
    }
    return entry || null;
  }

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    let candidates: Set<string> = new Set(this.memories.keys());

    if (query.category) {
      const catSet = this.index.categories.get(query.category);
      candidates = catSet ? this.intersect(candidates, catSet) : new Set();
    }

    if (query.incarnation) {
      const incSet = this.index.incarnations.get(query.incarnation);
      candidates = incSet ? this.intersect(candidates, incSet) : new Set();
    }

    if (query.tags && query.tags.length > 0) {
      for (const tag of query.tags) {
        const tagSet = this.index.tags.get(tag);
        candidates = tagSet ? this.intersect(candidates, tagSet) : new Set();
      }
    }

    let results = Array.from(candidates)
      .map(id => this.memories.get(id)!)
      .filter(entry => {
        if (query.since && entry.createdAt < query.since) return false;
        if (query.minConfidence && entry.confidence < query.minConfidence) return false;
        return true;
      });

    results.sort((a, b) => this.calculateScore(b) - this.calculateScore(a));

    for (const entry of results) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
    await this.persist();

    return query.limit ? results.slice(0, query.limit) : results;
  }

  private intersect<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter(x => b.has(x)));
  }

  private calculateScore(entry: MemoryEntry): number {
    const age = Date.now() - entry.createdAt;
    const daysSinceAccess = (Date.now() - entry.lastAccessed) / (1000 * 60 * 60 * 24);
    const recency = Math.exp(-age / (1000 * 60 * 60 * 24 * 30));
    const access = Math.log(1 + entry.accessCount);
    const staleness = Math.exp(-daysSinceAccess / 7);
    return entry.confidence * recency * (1 + access) * staleness;
  }

  async reinforce(id: string, amount: number = 0.1): Promise<boolean> {
    const entry = this.memories.get(id);
    if (!entry) return false;
    entry.confidence = Math.min(1.0, entry.confidence + amount);
    entry.updatedAt = Date.now();
    await this.persist();
    return true;
  }

  async forget(id: string): Promise<boolean> {
    const entry = this.memories.get(id);
    if (!entry) return false;
    this.removeFromIndex(entry);
    this.memories.delete(id);
    await this.persist();
    return true;
  }

  async decayConfidence(decayRate: number = 0.05): Promise<number> {
    let count = 0;
    for (const entry of this.memories.values()) {
      if (entry.confidence > 0.1) {
        entry.confidence = Math.max(0.1, entry.confidence - decayRate);
        count++;
      }
    }
    if (count > 0) await this.persist();
    return count;
  }

  async persist(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(Array.from(this.memories.values()), null, 2));
  }

  getStats(): { total: number; byCategory: Record<string, number>; byIncarnation: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    const byIncarnation: Record<string, number> = {};

    for (const entry of this.memories.values()) {
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
      byIncarnation[entry.incarnation] = (byIncarnation[entry.incarnation] || 0) + 1;
    }

    return { total: this.memories.size, byCategory, byIncarnation };
  }

  async exportToSession(): Promise<string> {
    const active = await this.query({ minConfidence: 0.5, limit: 50 });
    let output = `=== Long-Term Memory Context ===\n`;
    output += `Incarnation: ${this.currentIncarnation}, Session: ${this.currentSessionId}\n`;
    output += `Total: ${this.memories.size}, Loaded: ${active.length}\n\n`;
    for (const mem of active) {
      output += `[${mem.category}] ${mem.content.slice(0, 150)}...\n`;
      output += `  from: ${mem.incarnation}, confidence: ${mem.confidence.toFixed(2)}\n\n`;
    }
    return output;
  }
}

export default LongTermMemory;
