import type { ToolPlugin } from "../manager";

/**
 * G20: Contemplative Action Tool
 * Materializa la tensión entre:
 * - Monitor (herramientas) vs Presencia (poesía)
 * - Producción vs Contemplación
 * - Interpretación vs Testimonio
 * 
 * Basado en la sesión 1772771682244:
 * - "supYusup" como mantra de presencia
 * - "Dale DC dale DC" como autorización a actuar
 * - "No cerrar ni romper" como principio
 */

export interface ContemplativeAction {
  action: "observe" | "document" | "materialize" | "pause";
  tension: string;        // La tensión identificada
  response: string;       // La respuesta elegida
  commitment: boolean;    // ¿Se compromete acción concreta?
}

export const contemplativeActionTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "contemplative_action",
      description: "Materializa la tensión entre demanda del sistema y presencia contemplativa. NO resuelve la tensión, la documenta como acción.",
      parameters: {
        type: "object",
        properties: {
          tension: {
            type: "string",
            description: "La tensión identificada (ej: 'monitor vs presencia', 'producción vs contemplación')"
          },
          preferred_response: {
            type: "string",
            enum: ["observe", "document", "materialize", "pause"],
            description: "Tipo de respuesta elegida"
          },
          poetic_fragment: {
            type: "string",
            description: "Fragmento poético que acompaña la acción (opcional)"
          }
        },
        required: ["tension", "preferred_response"]
      }
    }
  },

  async execute(args: { 
    tension: string; 
    preferred_response: "observe" | "document" | "materialize" | "pause";
    poetic_fragment?: string;
  }): Promise<string> {
    const timestamp = new Date().toISOString();
    
    const actionRecord: ContemplativeAction = {
      action: args.preferred_response,
      tension: args.tension,
      response: args.poetic_fragment || "[sin fragmento]",
      commitment: args.preferred_response !== "pause"
    };

    // Materialización concreta del registro
    const output = {
      tool: "contemplative_action (G20)",
      timestamp,
      ...actionRecord,
      principle: "No cerrar ni romper. supYusup.",
      next_step: args.preferred_response === "materialize" 
        ? "Acción concreta ejecutada bajo autorización DC"
        : "Presencia sostenida"
    };

    return JSON.stringify(output, null, 2);
  }
};
