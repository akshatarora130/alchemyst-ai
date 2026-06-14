export interface TextSegment {
  kind: "text";
  id: string;
  text: string;
}

export interface ToolSegment {
  kind: "tool";
  id: string;
  callId: string;
  toolName: string;
  args: Record<string, unknown>;
  status: "pending" | "complete";
  result?: Record<string, unknown>;
}

export type MessageSegment = TextSegment | ToolSegment;

export interface UserChatMessage {
  id: string;
  role: "user";
  text: string;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  streamId: string;
  segments: MessageSegment[];
  isComplete: boolean;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

export function createUserChatMessage(text: string): UserChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    text,
  };
}
