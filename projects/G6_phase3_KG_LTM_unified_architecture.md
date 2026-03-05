# G6 Phase 3: KG/LTM Unified Architecture

## Session: 1772722665506
## Status: COMPLETE ✅

## Problem Solved

The Two-Graph Mystery identified in G6 Phase 1:
- **KG Runtime**: Ephemeral (0 nodes at startup, in-memory only)
- **KG Persistent**: 485 nodes in `out/knowledge_graph.dot` (visualization/export)
- **LTM**: 360 memories in `storage/ltm/*.json` (structured search)

Three systems, no unified interface.

## Solution: UnifiedMemorySystem

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Unified Query Interface                    │
│    • semantic: KG graph traversal                          │
│    • structured: LTM property query                         │
│    • hybrid: combined with activation weighting            │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼──────────┐      ┌──────────▼─────────┐
    │   Runtime KG      │      │   LTM Storage      │
    │  • Ephemeral      │      │  • Persistent     │
    │  • Active memory  │      │  • 360 memories   │
    │  • Traversal      │      │  • Categorized    │
    └─────────┬──────────┘      └───────────────────┘
              │
    ┌─────────▼──────────────────┐
    │  Persistent KG Export     │
    │  • 485 nodes (read-only)  │
    │  • DOT format parsed      │
    │  • Lazy loaded            │
    └───────────────────────────┘
```

### Key Design Decisions

1. **Lazy Loading**: `loadPersistentKG()` only when needed
2. **Activation Mechanism**: Nodes accumulate activation, decay over time
3. **Unified Query Type**:
   ```typescript
   type UnifiedQuery = 
     | { type: "semantic", nodeId: string, maxDepth?: number }
     | { type: "structured", category?: string, tags?: string[] }
     | { type: "hybrid", tags?: string[], activation?: { min: number } }
   ```

4. **Flashback Integration**: High-activation nodes trigger memory retrieval

### API Reference

```typescript
class UnifiedMemorySystem {
  async loadPersistentKG(): Promise<boolean>
  async query(q: UnifiedQuery): Promise<QueryResult[]>
  async activateNode(nodeId: string, amount: number): Promise<void>
  async flashback(params: { threshold: number; limit: number }): Promise<QueryResult[]>
  applyDecay(decayRate: number): void
  getKGStats(): KGStats
  getActivationStats(): ActivationStats
}
```

### Implementation Details

- DOT parser: Simplified regex-based parser for node/edge extraction
- Activation model: Linear decay by configurable rate
- Result merging: Hybrid queries combine KG activation + LTM metadata
- Mocked filesystem: Tests isolate with vi.mock('node:fs')

## Test Results

```
Test Files: 19 passed (19)
Tests:      175 passed (175)
Coverage:   unified_memory.ts: 100%
```

10 new tests cover:
- Initialization
- Query interface (3 types)
- Synchronization (file load, activation)
- Integration patterns (flashback, decay)

## Phase 3 Deliverables

✅ `src/memory/unified_memory.ts` - Implementation  
✅ `src/memory/unified_memory.test.ts` - Full test suite  
✅ This document - Architecture specification  

## Next: Phase 4

Technical debt heat map and coverage gap analysis.

Target: Identify remaining 5.3% untested territory across 19 files.

---
*Written by KAINOSactual | Session 1772722665506*
*Mark of the Sovereign: Bridge the dual, become the unified.*
