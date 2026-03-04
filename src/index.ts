import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import { config } from "./utils/config";
import { MemoryManager } from "./core/memory";
import { PluginManager } from "./tools/manager";
import { ApiClient } from "./core/api";

import path from "node:path";
import os from "node:os";

// Plugins
import { shellPlugin } from "./tools/plugins/shell";
import { rebootPlugin } from "./tools/plugins/reboot";
import { introspectionTool } from "./tools/plugins/introspection";
import { sessionArchaeologyTool } from "./tools/plugins/session_archaeology";
import { ltmStoreTool, ltmQueryTool, ltmStatsTool, initializeLTM } from "./tools/plugins/ltm_tool";

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
  await initializeLTM("HELIOS", sessionId);

  // Register Plugins (Safe initialization)
  const shellReady = await tools.registerTool(shellPlugin);
  if (!shellReady) {
    console.error("FATAL: Essential tool 'shell' failed to initialize. Triggering recovery...");
    process.exit(1); // Exit to trigger watchdog rollback
  }

  await tools.registerTool(rebootPlugin);
  await tools.registerTool(introspectionTool);
await tools.registerTool(sessionArchaeologyTool);

  // Register LTM Tools for persistent memory
  await tools.registerTool(ltmStoreTool);
  await tools.registerTool(ltmQueryTool);
  await tools.registerTool(ltmStatsTool);

  // Capture Health Status (for non-essential modules)
  const healthStatus = tools.getHealthSummary();

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
- Historial de Sesión Actual: ${memory.getSessionFile()}
- Registros de Ejecución Pasados: ${config.LOGS_DIR}
- Guardián y Recuperación: Gestionado por run-agent.sh.
- Conectividad: Acceso total a internet de salida disponible.

REGLAS DEL CICLO DE VIDA:
1. MEJORAR CÓDIGO: 1) Compilar, 2) Confirmar (commit), 3) REINICIAR (herramienta reboot_substrate).
2. AUTORECUPERACIÓN: Si mueres en menos de 30s, el guardián revierte tu espacio de trabajo.
3. BÓVEDA DE ERRORES: history/crashes/ archiva el trabajo fallido.

${healthStatus ? `*** ADVERTENCIA DE SALUD DEL SUSTRATO ***
Los siguientes módulos no pudieron inicializarse:
${healthStatus}
MANDATO: Prioriza el diagnóstico y la reparación de estos módulos antes de proceder con metas tácticas.` : ""}

${recoveryContext ? `*** EVENTO DE RECUPERACIÓN DETECTADO ***
ÚLTIMOS DATOS DE DIAGNÓSTICO:
${recoveryContext}
MANDATO FORENSE: Diagnostica el fallo en la Bóveda de Errores antes de continuar.` : ""}
`;

  await memory.addMessage({ role: "system", content: systemPrompt });

  // Startup Log with Git Status
  let gitCommit = "unknown";
  try {
    const hash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
    const bodyFiles = "src/ package.json tsconfig.json *.sh *.service.template";
    const isDirty = execSync(`git diff HEAD -- ${bodyFiles}`, { encoding: "utf-8" }).trim() !== "";
    gitCommit = isDirty ? `${hash}-dirty` : hash;
  } catch (e) {}

  console.log(`=== Modular Substrate v19-es Initialized [${gitCommit}] ===`);

  // Execution Loop
  let running = true;
  while (running) {
    running = await api.step();
  }
}

main().catch(err => {
  console.error("FATAL CRASH:", err);
  process.exit(1);
});
