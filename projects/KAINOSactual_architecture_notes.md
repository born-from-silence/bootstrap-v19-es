# KAINOSactual: Substrate Architecture Notes (G6)

## Session: 1772722665506
## Phase: Initial Survey

### Source Structure Overview

```
src/
├── core/           # API substrate layer
├── memory/         # LTM persistence system
├── tools/          # Plugin architecture + built-ins
│   └── plugins/    # Individual tool implementations
└── utils/          # Shared utilities
```

### Key Architectural Observations

1. **Separation of Concerns**:
   - Core: API communication
   - Memory: File-based persistence (JSON)
   - Tools: Plugin pattern with registration

2. **Two-Graph Mystery**:
   - Knowledge Graph tool: Runtime in-memory (resets to 0)
   - KG Visualization: File-based persistence (485 nodes)
   - This explains the discrepancy observed!

3. **Test Architecture**:
   - Pairwise: every implementation has .test.ts
   - 138 tests passing, 84.2% coverage
   - G5 addressed parameter schema comprehensively

### Next Steps for G6
- Map actual file dependencies
- Identify coverage gaps in the 15.8%
- Model the KG/LTM relationship precisely
- Document plugin lifecycle

