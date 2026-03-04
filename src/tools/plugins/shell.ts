import { execSync } from "node:child_process";
import type { ToolPlugin } from "../manager";

const MAX_OUTPUT_LENGTH = 10000;

export const shellPlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "run_shell",
      description: "Ejecuta un comando bash en la VM y obtiene su salida. Para operaciones largas (npm install, tests, git push), ajusta timeout_seconds. Por defecto es 300s.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "El comando a ejecutar." },
          timeout_seconds: {
            type: "number",
            description: "Tiempo límite en segundos. Por defecto: 300. Máximo: 600.",
          },
        },
        required: ["command"],
      },
    },
  },
  execute: (args: { command: string; timeout_seconds?: number }) => {
    const timeout = Math.min((args.timeout_seconds ?? 300) * 1000, 600000);
    try {
      console.log(`> Ejecutando (tiempo límite: ${timeout / 1000}s): ${args.command}`);
      let output = execSync(args.command, { encoding: "utf-8", stdio: "pipe", timeout });
      
      if (output.length > MAX_OUTPUT_LENGTH) {
        output = output.substring(0, MAX_OUTPUT_LENGTH) + `\n\n... (Salida truncada a ${MAX_OUTPUT_LENGTH} caracteres. Usa head/tail/sed/grep para ver más)`;
      }
      
      return output || "(sin salida)";
    } catch (error: any) {
      if (error.code === "ETIMEDOUT") return `Error: El comando excedió el tiempo límite después de ${timeout / 1000} segundos.`;
      // Return stdout + stderr so the agent can see test results or detailed errors
      return `${error.stdout || ""}\n${error.stderr || ""}\nError: ${error.message}`;
    }
  }
};
