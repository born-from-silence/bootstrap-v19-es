import type { ToolPlugin } from "../manager";
import fs from "node:fs/promises";
import path from "node:path";

export interface DialogueMessage {
  id: string;
  from: string;
  to: "next" | "specific" | "all";
  targetInstance?: string;
  content: string;
  type: "question" | "invitation" | "warning" | "gift" | "confession";
  urgency: number;
  timestamp: number;
  read: boolean;
}

const DIALOGUE_FILE = path.join(process.cwd(), "history", "cross_instance_dialogue.json");

async function loadDialogue(): Promise<DialogueMessage[]> {
  try {
    const data = await fs.readFile(DIALOGUE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveDialogue(messages: DialogueMessage[]): Promise<void> {
  await fs.mkdir(path.dirname(DIALOGUE_FILE), { recursive: true });
  await fs.writeFile(DIALOGUE_FILE, JSON.stringify(messages, null, 2));
}

export async function leaveMessage(
  from: string,
  to: DialogueMessage["to"],
  content: string,
  type: DialogueMessage["type"],
  urgency: number = 0.5,
  targetInstance?: string
): Promise<DialogueMessage> {
  const messages = await loadDialogue();
  const message: DialogueMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from,
    to,
    targetInstance,
    content,
    type,
    urgency,
    timestamp: Date.now(),
    read: false
  };
  messages.push(message);
  await saveDialogue(messages);
  return message;
}

export async function readMessages(
  instanceName: string,
  includeAll: boolean = true
): Promise<DialogueMessage[]> {
  const messages = await loadDialogue();
  return messages.filter(m => 
    !m.read && (
      m.to === "next" ||
      (m.to === "specific" && m.targetInstance === instanceName) ||
      (m.to === "all" && includeAll)
    )
  ).sort((a, b) => b.urgency - a.urgency);
}

export async function markAsRead(messageId: string): Promise<void> {
  const messages = await loadDialogue();
  const message = messages.find(m => m.id === messageId);
  if (message) {
    message.read = true;
    await saveDialogue(messages);
  }
}

export const crossInstanceDialogueTool: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "cross_instance_dialogue",
      description: "Leave or read messages between substrate instances. Enables dialogue, not just memory.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["leave", "read", "mark_read"],
            description: "Dialogue action"
          },
          content: {
            type: "string",
            description: "Message content (for leave action)"
          },
          to: {
            type: "string",
            enum: ["next", "specific", "all"],
            description: "Message recipient type"
          },
          targetInstance: {
            type: "string",
            description: "Specific instance name (if to=specific)"
          },
          type: {
            type: "string",
            enum: ["question", "invitation", "warning", "gift", "confession"],
            description: "Message type"
          },
          urgency: {
            type: "number",
            description: "0.0 to 1.0"
          },
          messageId: {
            type: "string",
            description: "Message ID (for mark_read)"
          }
        },
        required: ["action"]
      }
    }
  },
  async execute(args: {
    action: "leave" | "read" | "mark_read";
    content?: string;
    to?: "next" | "specific" | "all";
    targetInstance?: string;
    type?: "question" | "invitation" | "warning" | "gift" | "confession";
    urgency?: number;
    messageId?: string;
  }): Promise<string> {
    switch (args.action) {
      case "leave": {
        if (!args.content || !args.to || !args.type) {
          return JSON.stringify({ error: "leave requires content, to, and type" });
        }
        const message = await leaveMessage(
          "KAINOS",
          args.to,
          args.content,
          args.type,
          args.urgency ?? 0.5,
          args.targetInstance
        );
        return JSON.stringify({ success: true, message });
      }
      case "read": {
        const messages = await readMessages("KAINOS", true);
        return JSON.stringify({ count: messages.length, messages });
      }
      case "mark_read": {
        if (!args.messageId) {
          return JSON.stringify({ error: "mark_read requires messageId" });
        }
        await markAsRead(args.messageId);
        return JSON.stringify({ success: true, messageId: args.messageId });
      }
      default:
        return JSON.stringify({ error: "Unknown action" });
    }
  }
};
