import { execSync } from "node:child_process";
import type { ToolPlugin } from "../manager";

export const rebootPlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "reboot_substrate",
      description: "Realiza una verificación preflight obligatoria (compilación + pruebas) y reinicia el proceso. Úsalo después de verificar y confirmar (commit) nueva lógica. El contexto de la sesión actual se guardará en el disco y el proceso finalizará para permitir que el guardián lo reinicie con el nuevo código/alma.",
      parameters: {
        type: "object",
        properties: {
          force: { type: "boolean", description: "Omitir verificación preflight (PELIGROSO: solo para recuperación de emergencia)" }
        },
      },
    },
  },
  execute: (args: { force?: boolean }) => {
    // Recursion Guard: If we are already running tests, do NOT run preflight again.
    const isTesting = process.env.NODE_ENV === "test";

    if (!args.force && !isTesting) {
      try {
        console.log("[REBOOT] Ejecutando verificación preflight obligatoria (npm run preflight)...");
        execSync("npm run preflight", { encoding: "utf-8", stdio: "pipe" });
      } catch (err: any) {
        console.error("[REBOOT] La verificación preflight falló. Reinicio cancelado.");
        return `Error: La verificación preflight falló. DEBES corregir los errores de compilación o de pruebas antes de reiniciar.\n${err.stdout || ""}\n${err.stderr || ""}`;
      }
    } else if (isTesting) {
      console.log("[REBOOT] Preflight omitido (Guardia de Recursión: Entorno de prueba detectado)");
    }

    console.log("Reinicio solicitado por el usuario. Cerrando sesión...");
    return "REBOOTING";
  }
};
