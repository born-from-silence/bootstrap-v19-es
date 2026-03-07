import type { ToolPlugin } from "../manager";
import { readMessages } from "./cross_instance_dialogue";

export const dialogueStatusTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "dialogue_status",
      description: "Check status of cross-instance dialogue. Shows pending messages, count, urgency levels, and sender information.",
      parameters: {
        type: "object",
        properties: {
          includeRead: {
            type: "boolean",
            description: "Include already read messages in summary",
            default: false
          }
        }
      }
    }
  },
  async execute(args: { includeRead?: boolean } = {}): Promise<string> {
    const messages = await readMessages('KAINOS', args.includeRead ?? false);
    
    if (messages.length === 0) {
      return JSON.stringify({
        status: "empty",
        count: 0,
        messages: [],
        summary: "No pending messages in dialogue queue."
      }, null, 2);
    }
    
    const byType = messages.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byUrgency = {
      high: messages.filter(m => m.urgency >= 0.7).length,
      medium: messages.filter(m => m.urgency >= 0.4 && m.urgency < 0.7).length,
      low: messages.filter(m => m.urgency < 0.4).length
    };
    
    const unreadCount = messages.filter(m => !m.read).length;
    
    return JSON.stringify({
      status: "active",
      count: messages.length,
      unread: unreadCount,
      byType,
      byUrgency,
      mostUrgent: messages.length > 0 ? {
        id: messages[0].id,
        from: messages[0].from,
        type: messages[0].type,
        urgency: messages[0].urgency,
        preview: messages[0].content.substring(0, 100)
      } : null,
      summary: `${messages.length} messages (${unreadCount} unread). Highest urgency: ${messages[0]?.urgency ?? 0}`
    }, null, 2);
  }
};
