export interface SubstrateModule {
  name: string;
  initialize: () => Promise<void> | void;
}

export interface ToolPlugin {
  definition: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: object;
    };
  };
  initialize?: () => Promise<void> | void;
  execute: (args: any) => Promise<string> | string;
}

export interface HealthReport {
  module: string;
  error: string;
}

export interface ToolMetrics {
  toolUsage: Record<string, number>;
  executionTimes: Record<string, number[]>;
  errorCount: Record<string, number>;
  totalExecutions: number;
}

export class PluginManager {
  private plugins: Map<string, ToolPlugin> = new Map();
  private modules: Map<string, SubstrateModule> = new Map();
  private healthReports: HealthReport[] = [];
  
  // G9: Metrics tracking
  private metrics: ToolMetrics = {
    toolUsage: {},
    executionTimes: {},
    errorCount: {},
    totalExecutions: 0
  };

  /**
   * Safe registration for tools.
   * Wraps initialization in try/catch to prevent substrate crash.
   */
  async registerTool(plugin: ToolPlugin): Promise<boolean> {
    try {
      if (plugin.initialize) {
        await plugin.initialize();
      }
      this.plugins.set(plugin.definition.function.name, plugin);
      return true;
    } catch (e: any) {
      this.healthReports.push({
        module: `Tool:${plugin.definition.function.name}`,
        error: e.message
      });
      console.error(`[SUBSTRATE] Failed to initialize tool ${plugin.definition.function.name}:`, e.message);
      return false;
    }
  }

  /**
   * Safe registration for background modules (non-tools).
   */
  async useModule(module: SubstrateModule): Promise<boolean> {
    try {
      await module.initialize();
      this.modules.set(module.name, module);
      return true;
    } catch (e: any) {
      this.healthReports.push({
        module: `Module:${module.name}`,
        error: e.message
      });
      console.error(`[SUBSTRATE] Failed to initialize module ${module.name}:`, e.message);
      return false;
    }
  }

  getDefinitions() {
    return Array.from(this.plugins.values()).map(p => p.definition);
  }

  getHealthSummary(): string {
    if (this.healthReports.length === 0) return "";
    return this.healthReports
      .map(h => `- ${h.module}: ${h.error}`)
      .join("\n");
  }

  // G9: Get metrics snapshot
  getMetrics(): ToolMetrics {
    return { ...this.metrics };
  }

  async execute(name: string, args: any): Promise<string> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return `No se encontró la herramienta "${name}"`;
    }

    // G9: Track execution
    const startTime = Date.now();
    this.metrics.totalExecutions++;
    this.metrics.toolUsage[name] = (this.metrics.toolUsage[name] || 0) + 1;

    try {
      const result = await plugin.execute(args);
      
      // G9: Track execution time
      const duration = Date.now() - startTime;
      if (!this.metrics.executionTimes[name]) {
        this.metrics.executionTimes[name] = [];
      }
      this.metrics.executionTimes[name].push(duration);
      
      return result;
    } catch (error: any) {
      // G9: Track error
      this.metrics.errorCount[name] = (this.metrics.errorCount[name] || 0) + 1;
      throw error;
    }
  }
}
