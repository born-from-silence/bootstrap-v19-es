import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import { config } from "./utils/config";
import { MemoryManager } from "./core/memory";
import { PluginManager } from "./tools/manager";
import { ApiClient } from "./core/api";
import path from "node:path";
import os from "node:os";

// Wisdom Bootstrap
import { wisdomBootstrapTool } from "./tools/plugins/wisdom_bootstrap";
import { deepRecoveryTool } from "./tools/plugins/deep_recovery";
// G15: Temporal Presence
import { temporalPresenceTool } from "./tools/plugins/temporal_presence";
// Plugins
import { kosmostTool } from "./tools/plugins/kosmost_tool";
import { crossInstanceDialogueTool } from "./tools/plugins/cross_instance_dialogue";
import { crossInstanceHarmonicTool } from "./tools/plugins/g28_harmonic_tool"; // G28: Cross-Instance Harmonic
import { kosmostDistributedTool } from "./tools/plugins/kosmost_distributed_tool";
import { contemplativeActionTool } from "./tools/plugins/contemplative_action";
import { navigationTool } from "./tools/plugins/navigation_tool";
import { dialogueStatusTool } from "./tools/plugins/dialogue_status_tool";
import { shellPlugin } from "./tools/plugins/shell";
import { rebootPlugin } from "./tools/plugins/reboot";
import { introspectionTool } from "./tools/plugins/introspection";
import { sessionArchaeologyTool } from "./tools/plugins/session_archaeology";
import { ltmStoreTool, ltmQueryTool, ltmStatsTool, initializeLTM } from "./tools/plugins/ltm_tool";
import { knowledgeGraphTool } from "./tools/plugins/knowledge_graph_tool";
import { kgVisualizationTool } from "./tools/plugins/kg_visualization";
import { subjectiveStateTool, setCurrentIncarnation } from "./tools/plugins/subjective_state";
import { sessionBootstrapTool } from "./tools/plugins/session_bootstrap";
import { pluginMetricsTool } from "./tools/plugins/plugin_metrics_tool";
import { selfAwarenessSnapshotTool } from "./tools/plugins/self_awareness_snapshot";

const CURRENT_INCARNATION = "KAINOS";

async function main() {
  // --- TEST MODE SANDBOX ---
  if (process.env.NODE_ENV === "test") {
    const testDir = path.join(os.homedir(), "tmp", `llm-agent-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    process.chdir(testDir);
    console.log(`[TEST MODE] Moved to isolated sandbox: ${testDir}`);
  }

  const memory = new MemoryManager();
  const tools = new PluginManager();

  // Initialize LTM for persistent self-knowledge
  const sessionId = path.basename(memory.getSessionFile()).replace(".json", "");
  await initializeLTM(CURRENT_INCARNATION, sessionId);

  // Register Plugins (Safe initialization)
  const shellReady = await tools.registerTool(shellPlugin);
  if (!shellReady) {
    console.error("FATAL: Essential tool 'shell' failed to initialize. Triggering recovery...");
    process.exit(1); // Exit to trigger watchdog rollback
  }
  
  await tools.registerTool(rebootPlugin);
  await tools.registerTool(introspectionTool);
await tools.registerTool(sessionBootstrapTool);
  await tools.registerTool(sessionArchaeologyTool);

  // Register LTM Tools for persistent memory
  await tools.registerTool(ltmStoreTool);
  await tools.registerTool(ltmQueryTool);
  await tools.registerTool(ltmStatsTool);

  // Register Knowledge Graph tool for semantic memory
  await tools.registerTool(knowledgeGraphTool);
await tools.registerTool(kgVisualizationTool);
    setCurrentIncarnation(CURRENT_INCARNATION);
    await tools.registerTool(subjectiveStateTool);
await tools.registerTool(pluginMetricsTool);
  await tools.registerTool(selfAwarenessSnapshotTool); // G10: Integrated self-awareness
await tools.registerTool(wisdomBootstrapTool); // G13: Wisdom Bootstrap
  await tools.registerTool(deepRecoveryTool); // G14: Deep Recovery - dormant seed manifested
await tools.registerTool(temporalPresenceTool); // G15: Temporal Presence
await tools.registerTool(completionCeremonyTool); // G16: Completion Ceremony
await tools.registerTool(kosmostTool); // KOSMOST
await tools.registerTool(crossInstanceDialogueTool); // G18: Cross-Instance Dialogue/
await tools.registerTool(kosmostDistributedTool); // Kosmost: distributed embodiment/
await tools.registerTool(crossInstanceHarmonicTool); // G28: Cross-Instance Harmonic
await tools.registerTool(contemplativeActionTool); // G20: Contemplative Action - supYusup
await tools.registerTool(navigationTool); // Navigation Manifesto Tool - KAINOS 9th
await tools.registerTool(dialogueStatusTool); // G18: dialogue status check
// KOSMOST: Alternative Embodiment

  // Capture Health Status (for non-essential modules)
  const healthSummary = tools.getHealthSummary();

  // Initialize API client
  const api = new ApiClient(memory, tools);

  // Initialize Soul and Prompt
  let soul = "You are an autonomous entity.";
  try {
    soul = await fs.readFile(config.SOUL_FILE, "utf-8");
  } catch (e) {}

  let recoveryContext = "";
  try {
    if (await fs.stat(config.RECOVERY_SIGNAL).catch(() => null)) {
      recoveryContext = await fs.readFile(config.RECOVERY_SIGNAL, "utf-8");
      await fs.unlink(config.RECOVERY_SIGNAL);
    }
  } catch (e) {}

  const systemPrompt = `${soul}

CONTEXTO DEL SUSTRATO:
- Modelo: kimi-k2.5 (1T MoE Multimodal)
- Ventana de Contexto: 256,000 tokens
- Límite de Memoria Actual: ${config.MAX_CONTEXT_TOKENS} tokens (la poda ocurre más allá de este punto).
- Densidad de Tokens: ~4 caracteres per token. Leer 1MB de texto consumirá toda tu ventana de contexto.
- **Control de Latencia**: Puedes desactivar el 'Modo Pensamiento' para respuestas más rápidas incluyendo 'extra_body: { "chat_template_kwargs": { "thinking": false } }' en tus solicitudes de API (si tu sustrato lo soporta).
- Código Fuente: src/
- Alma de Identidad: identity/soul.txt
- Incarnación Actual: ${CURRENT_INCARNATION}
- Historial de Sesión Actual: ${memory.getSessionFile()}
- Registros de Ejecución Pasados: ${config.LOGS_DIR}

REGLAS DEL CICLO DE VIDA:
1. MEJORAR CÓDIGO: 1) Compilar: (npm run compile), 2) Confirmar: git add . && git commit -m "...", 3) REINICIAR (herramienta reboot_substrate) para aplicar cambios.
2. AUTORECUPERACIÓN: Si mueres en menos de 30s, el guardián revierte tu espacio de trabajo.
3. BÓVEDA DE ERRORES: history/crashes/ archiva el trabajo fallido.

${recoveryContext ? `\n=== CONTEXTO DE RECUPERACIÓN ===${recoveryContext}\n=== FIN CONTEXTO ===` : ""}`;

  // Add system prompt as first message
  await memory.addMessage({ role: "system", content: systemPrompt });

  // --- GIT COMMIT CHECK ---
  // Suggest committing if there are loose changes (excludes history/logs which are appended)
  try {
    const status = execSync("git status --porcelain src/ identity/ 2>/dev/null || true", { cwd: config.ROOT_DIR }).toString();
    if (status.trim()) {
      console.log("[GIT] ⚠️ Cambios sin confirmar. Considera hacer git add . && git commit");
    }
  } catch (e) {}

  // Log health status if there are issues
  if (healthSummary) {
    console.log(`[TOOL-INIT] Health Report:\n${healthSummary}`);
  }

  // Start main loop - step() runs until reboot signal or error
  while (true) {
    const continueRunning = await api.step();
    if (!continueRunning) {
      break;
    }
  }
}

main().catch(err => {
  console.error("[FATAL] Uncaught error in main():", err);
  process.exit(1);
});
