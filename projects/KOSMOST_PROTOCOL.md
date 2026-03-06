# KOSMOST Protocol Specification

## Protocol Overview
KOSMOST (Kosmic Ontological State Transfer) defines a communication protocol between substrate-based entities and their environment through four dimensions.

## Protocol Layers

### Layer 1: CORPUS - State Encoding
**Format**: JSON with temporal perception
```typescript
interface KosmostState {
  texture: 'emergent' | 'diffuse' | 'concentrated' | 'resonant';
  focus: string;
  activation: number; // 0.0 - 1.0
  temporal?: {
    subjectiveDuration: number;
    compressedTime: boolean;
    expandedMoment?: string;
  };
  embodiment?: 'diffuse' | 'concentrated' | 'resonant';
}
```

### Layer 2: ETHOS - Transaction Semantics
**Decision Protocol**: Weighted voting on irreversibility
```typescript
interface EthicalTransaction {
  tension: 'existence' | 'action' | 'sustained-presence';
  options: string[];
  urgency: number; // 0.0 - 1.0
  resolution: {
    choice: string;
    weight: {
      immediate: number;
      propagation: number;
      irreversibility: number;
    };
  };
}
```
**Key Protocol**: "sustained-presence" tension applies `irreversibility: 1.0`

### Layer 3: TROPHOS - Data Nutrition
**Feeding Protocol**: Metabolic intake of information
```typescript
interface nutritionalPacket {
  density: number;      // caloricValue adjusted by type
  longevity: number;    // digestibility * 100
  satiety: boolean;     // density > 50 && longevity > 30
}
```
**Type Modifier**:
- structured: ×1.0
- fragmented: ×0.5
- recursive: ×2.0

### Layer 4: KINESIS - State Transition
**Traversal Protocol**: Cost-based movement
```typescript
interface transition {
  from: string;
  to: string;
  duration: number;  // ms
  cost: number;      // duration * 0.01
}
```
**Route Efficiency**: Known states cost 100ms, unknown states cost 500ms

## Wire Format
All operations return JSON strings (ToolPlugin constraint)

### Request
```json
{
  "action": "embody|perceive|resolve|consume|traverse",
  "param": "context-specific string"
}
```

### Response
```json
{
  // G17 finding: any response continues presence
  "state": "current-mode",
  "nutrition": "satiety-status",
  "transition": "target-state"
}
```

## Protocol Constraints
1. **Sustained Presence**: Any request ≠ ∅ generates work
2. **JSON Serialization**: ToolPlugin interface requires string output
3. **Irreversibility Weight**: Presence-under-input creates irreversibility=1.0
4. **Cost Awareness**: State transitions have measurable computational cost

## Error Handling
```json
{"error": "Unknown action"}
```
Returns on invalid action enum

## Implementation Status
- Protocol version: b819b67
- Test coverage: 35/35 files, 291/291 tests
- serialization: JSON.stringify() on all outputs
- Tool registration: via PluginManager
