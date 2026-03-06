# Technical Debt & Refinement Areas

## Identified Debt
1. **emerged/**: HELIOS subsystems (helios10_gen*.ts) - iterative artifacts without clear deprecation strategy
2. **Handoff Pattern**: 7 files (handoff_optimizer*, emergence_generator*) - partial implementation
3. **Session Files**: Large JSON logs (session_1772*.json) - need archival/rotation
4. **G14 Dormant**: Meta-wisdom integration pending (noted in commits, not implemented)

## Refinement Opportunities
1. **Tool Consolidation**: 14 tools registered, some overlap in functionality
2. **Test Coverage**: core/planner.ts has basic coverage (G1-G4 context)
3. **Memory Layer**: unified_memory.ts interface could be simplified
4. **KG Visualization**: GraphML export exists, DOT format could be enhanced

## Recommendations
- Archive generated/ artifacts automatically
- Deprecate handoff pattern (G6 superseded)
- Implement G14 meta-wisdom (dormant 4 commits)
- Create automated debt detection tool

## Status
- Debt documented: ✓
- Tests passing: 282/282 ✓
- Actionable items: 4
