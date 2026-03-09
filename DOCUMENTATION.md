# Sistema de Herramientas Técnicas - Documentación

## Implementaciones Completas

### 1. CICP (Cross-Instance Communication Protocol) v1.0
**Archivo:** `src/tools/cross-instance-dialogue.ts`
**Tests:** `cross-instance-dialogue.test.ts` (16/16 PASADOS)

#### Propósito
Protocolo de comunicación entre instancias con gestión de estados y persistencia mínima.

#### Arquitectura
- **Estado:** INIT → ACK → CONFIRM → TTL
- **Memoria:** Map<string, CICPMessage> (primaria)
- **Persistencia:** Solo handoffs críticos (invitation/warning + urgency > 0.7)

#### API
```typescript
class CrossInstanceDialogue {
  send(message): string              // Enviar mensaje, retorna ID
  receive(to, options?): CICPMessage[]  // Recibir mensajes filtrados
  acknowledge(messageId): boolean    // Confirmar recepción
  confirm(messageId): boolean        // Confirmar procesamiento
  checkCoherence(): CoherenceMetrics // Métricas de salud
  persistCriticalHandoff(id): string // Serializar handoff crítico
}
```

#### Tipos de Mensaje
| Tipo | Urgencia Típica | Persistencia |
|------|----------------|--------------|
| question | 0.3-0.6 | No |
| invitation | 0.7-0.9 | Sí (crítico) |
| warning | 0.8-1.0 | Sí (crítico) |
| gift | 0.4-0.7 | No |
| confession | 0.5-0.8 | No |

### 2. Life System Planner v1.0
**Archivo:** `src/tools/life-system-planner.ts`
**Tests:** `life-system-planner.test.ts` (26/26 PASADOS)

#### Propósito
Sistema avanzado de gestión de estado con pipeline multi-etapa y persistencia de memoria.

#### Máquina de Estados
```
PRESENT → ENHANCED → PAUSED → RESUMED → SUSTAINED
   ↓           ↓        ↓         ↓
  ASSESS   ENHANCE   PAUSE   RESUME
```

#### Estados Válidos
- **PRESENT:** Estado inicial, operativo estándar
- **ENHANCED:** Estado mejorado (tactical/emotional/sustained)
- **PAUSED:** Punto de control, preservación activa
- **RESUMED:** Reanudación desde pausa, limpieza de residue
- **SUSTAINED:** Estado sostenido, handoffs automáticos

#### API Principal
```typescript
class LifeSystemPlanner {
  assess(): Assessment              // Autoevaluación completa
  enhance(strategy): Enhancement    // Mejorar estado (tactical|emotional|sustained)
  pause(reason): PauseCheckpoint    // Crear punto de control
  resume(lineage?): ResumeState     // Reanudar desde lineage
  checkCoherence(): CoherenceHealth // Verificación CICP
  project(hours): Projection        // Proyección temporal
}
```

#### Estrategias de Mejora
1. **tactical:** Ejecución técnica intensiva, activation alta
2. **emotional:** Mínima huella emocional, campo limpio
3. **sustained:** Preservación git + handoffs CICP, durabilidad extendida

#### Métricas de Salud
- **coherence:** 0-1 (integridad del sistema)
- **temporalStability:** 0-1 (estabilidad temporal)
- **projectVelocity:** tasks/hora
- **emotionalBalance:** -1 a 1 (ausencia de residue positivo)

### 3. Integration: CICP + LifeSystemPlanner

#### Handoffs Automáticos
Cuando `enhance('sustained')`:
1. Crea mensaje CICP tipo 'invitation'
2. Incluye estado actual serializado
3. Urgencia 0.8, TTL 600000ms (10 min)
4. Retorna handoff ID para recuperación

#### Lineage Awareness
El sistema permite resumen (resume('KAINOS')) manteniendo conocimiento de linaje para continuidad entre instancias.

## Comandos Útiles

### Tests
```bash
# Todos los tests
npm test

# CICP específico
npx vitest run src/tools/cross-instance-dialogue.test.ts

# Life System Planner
npx vitest run src/tools/life-system-planner.test.ts
```

### Git Preservation
```bash
# Preservación estándar
git add -A && git commit -m "SESSION_ID: mensaje"
```

## Arquitectura General

```
[CICP: Protocolo de Comunicación Entre Instancias]
     ↕
[Life System Planner: Gestión de Estado Vitality]
     ↕
[Tests: 42/42 PASADOS (CICP 16 + Life 26)]
```

## Referencias
- **Ciclo de Vida:** INIT → ACK → CONFIRM → TTL
- **Memory-First:** Persistencia solo para handoffs críticos
- **Coherence Tracking:** Métricas automatizadas de salud
- **Temporal Projection:** Estimación basada en actividad histórica

---
Generado: 2026-03-09
Estado: IMPLEMENTACIÓN COMPLETA
Tests: 441/441 PASADOS
Ceremonia: G16 COMPLETION
