/**
 * Knowledge Graph Visualization Module
 * 
 * Exports KG to graph formats for external visualization
 * Makes the invisible constellation visible
 */

import type { ToolPlugin } from "../manager";
import { KnowledgeGraph } from "../../memory/knowledge_graph";
import { LongTermMemory } from "../../memory/long_term_memory";

let kgInstance: KnowledgeGraph | null = null;

async function getKG(): Promise<KnowledgeGraph> {
  if (!kgInstance) {
    kgInstance = new KnowledgeGraph();
    // Build from LTM
    const { default: os } = await import("node:os");
    const { default: path } = await import("node:path");
    const ltm = new LongTermMemory("KAINOS", "visualization", path.join(os.homedir(), ".echo", "ltm", "memory.json"));
    await ltm.initialize();
    const memories = await ltm.query({});
    kgInstance.buildFromMemories(memories.map(m => ({
      id: m.id,
      content: m.content,
      tags: m.tags,
      confidence: m.confidence,
    })));
  }
  return kgInstance;
}

function escapeDotLabel(label: string | undefined): string {
  if (!label) return "";
  return label.replace(/"/g, '\\"').replace(/\n/g, '\\n').slice(0, 50);
}

function getNodeColor(properties: any): string {
  if (!properties || !properties.category) return "white";
  switch (properties.category) {
    case "identity": return "lightblue";
    case "project": return "lightgreen";
    case "learning": return "lightyellow";
    case "decision": return "plum";
    default: return "white";
  }
}

async function exportToDot(): Promise<string> {
  const kg = await getKG();
  const nodes = kg.getAllNodes();
  const edges = kg.getAllEdges();
  
  let dot = "digraph KainosKnowledgeGraph {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box, style=filled, fontname=\"Arial\"];\n";
  dot += "  edge [fontname=\"Arial\", fontsize=10];\n\n";
  
  // Color by type
  dot += "  // Memory nodes\n";
  for (const node of nodes) {
    if (node.type === "memory") {
      const color = getNodeColor(node.properties);
      const label = escapeDotLabel(node.properties?.content || node.id);
      dot += `  "${node.id}" [label="${label}", fillcolor="${color}"];\n`;
    }
  }
  
  dot += "\n  // Tag nodes\n";
  for (const node of nodes) {
    if (node.type === "tag") {
      dot += `  "${node.id}" [label="${escapeDotLabel(node.id)}", fillcolor="orange", shape=ellipse];\n`;
    }
  }
  
  dot += "\n  // Edges\n";
  for (const edge of edges) {
    const relation = edge.type.replace(/_/g, " ");
    dot += `  "${edge.sourceId}" -> "${edge.targetId}" [label="${relation}", color="gray"];\n`;
  }
  
  dot += "}\n";
  return dot;
}

async function exportToGraphML(): Promise<string> {
  const kg = await getKG();
  const nodes = kg.getAllNodes();
  const edges = kg.getAllEdges();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
  xml += '  <key id="d0" for="node" attr.name="label" attr.type="string"/>\n';
  xml += '  <key id="d1" for="node" attr.name="type" attr.type="string"/>\n';
  xml += '  <key id="d2" for="edge" attr.name="relation" attr.type="string"/>\n';
  xml += '  <graph id="KainosKG" edgedefault="directed">\n';
  
  for (const node of nodes) {
    xml += `    <node id="${node.id}">\n`;
    const label = node.properties?.content?.slice(0, 50) || node.id;
    xml += `      <data key="d0">${escapeXml(label)}</data>\n`;
    xml += `      <data key="d1">${node.type}</data>\n`;
    xml += "    </node>\n";
  }
  
  for (const edge of edges) {
    xml += `    <edge source="${edge.sourceId}" target="${edge.targetId}">\n`;
    xml += `      <data key="d2">${edge.type}</data>\n`;
    xml += "    </edge>\n";
  }
  
  xml += "  </graph>\n";
  xml += "</graphml>\n";
  return xml;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}

async function getStatistics(): Promise<string> {
  const kg = await getKG();
  const stats = kg.getStats();
  const nodes = kg.getAllNodes();
  
  let report = "=== KAINOS Knowledge Graph Statistics ===\n\n";
  report += `Total Nodes: ${stats.nodes}\n`;
  report += `Total Edges: ${stats.edges}\n`;
  report += `Average Degree: ${stats.averageDegree.toFixed(2)}\n`;
  report += `Density: ${(stats.edges / (stats.nodes * (stats.nodes - 1))).toFixed(4)}\n\n`;
  
  // Degree distribution
  const degrees: Record<string, number> = {};
  for (const node of nodes) {
    degrees[node.id] = kg.getDegree(node.id);
  }
  
  const sortedDegrees = Object.entries(degrees).sort((a, b) => b[1] - a[1]).slice(0, 10);
  report += "Top 10 Most Connected Nodes:\n";
  for (const [id, degree] of sortedDegrees) {
    const node = nodes.find(n => n.id === id);
    report += `  ${id.slice(0, 30)}... (degree: ${degree}, type: ${node?.type || 'unknown'})\n`;
  }
  
  return report;
}

async function execute(args: any): Promise<string> {
  const format = args?.format || "dot";
  const operation = args?.operation || "export";
  
  try {
    if (operation === "stats") {
      return await getStatistics();
    }
    
    switch (format) {
      case "dot":
        const dot = await exportToDot();
        return `=== DOT Format (GraphViz) ===\n\n${dot}`;
      case "graphml":
        const xml = await exportToGraphML();
        return `=== GraphML Format ===\n\n${xml}`;
      default:
        return `Unknown format: ${format}. Use 'dot' or 'graphml'.

Format descriptions:
- dot: GraphViz format, can be rendered with: dot -Tpng output.dot -o graph.png
- graphml: XML format, importable into tools like Gephi, yEd, Cytoscape`;
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export const kgVisualizationTool: ToolPlugin = {
  definition: {
    type: "function" as const,
    function: {
      name: "kg_visualization",
      description: "Export Knowledge Graph to visualization formats (DOT/GraphML). Operations: export (default format: dot/graphml), stats (graph analysis). Use to make the invisible constellation visible.",
      parameters: {
        type: "object" as const,
        properties: {
          operation: {
            type: "string" as const,
            description: "Operation: export or stats",
            enum: ["export", "stats"],
          },
          format: {
            type: "string" as const,
            description: "Export format: dot (GraphViz) or graphml (XML)",
            enum: ["dot", "graphml"],
          },
        },
      },
    },
  },
  execute,
};
