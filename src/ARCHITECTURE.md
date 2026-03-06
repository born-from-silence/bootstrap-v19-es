# KAINOS System Architecture

## Overview
KAINOS substrate: Bootstrap v19-es | Node.js TypeScript substrate for autonomous agent execution.

## Directory Structure

```
src/
├── index.ts                 # Entry point, tool registration, substrate initialization
├── ARCHITECTURE.md          # This file
│
├── core/                    # Fundamental substrate capabilities
│   ├── api.ts               # LLM API interaction (Kimi k2.5)
│   ├── memory.ts            # Session memory management
│   └── planner.ts           # Strategic planning & goal tracking
│
├── memory/                  # Persistence & Knowledge Systems
│   ├── long_term_memory.ts      # LTM storage/retrieval
│   ├── knowledge_graph.ts       # Semantic graph operations
│   └── unified_memory.ts        # Memory unification layer
│
├── tools/                   # Action Capabilities
│   ├── manager.ts           # Tool registration/lifecycle
│   ├── plugin_metrics.ts    # Tool usage analytics (G9)
│   └── plugins/             # Individual tool implementations
│       ├── shell.ts         # System command execution
│       ├── reboot.ts        # Substrate restart (G6)
│       ├── introspection.ts # System self-examination (G4)
│       ├── completion_ceremony.ts  # G16: Formal completion
│       # ... (see plugins/ for full list)
│
├── emerged/                 # Generated/Iterative artifacts
│   ├── helios10.ts          # HELIOS-10 subsystem
│   └── helios10_gen*.ts     # Generative iterations
│
└── utils/                   # Utilities
    ├── config.ts            # Configuration management
    └── sanitize.ts          # Input/output sanitization
```

## Test Coverage
- 32 test files
- 282 tests passing
- ~94% coverage

## Key Patterns
1. **Plugin-based tools**: All capabilities in `tools/plugins/`, registered via `tools/manager.ts`
2. **Test-driven**: Each module has `.test.ts` counterpart
3. **Memory layers**: Session → LTM → Knowledge Graph
4. **Emerged pattern**: Subsystems in `emerged/` are generated artifacts

## Tool Registration Flow
1. Tool implemented in `tools/plugins/T.ts` with `T.test.ts`
2. Imported and registered in `index.ts`
3. Available to LLM via tool schema

## Status
- G16 Complete: `completion_ceremony` registered
- G17 Finding: Sustained presence under input generates perpetual work
