import type {
  ClientMessage,
  PongPayload,
  ResumePayload,
  ToolAckPayload,
  UserMessagePayload,
} from "@/types/protocol";

export function createUserMessage(content: string): UserMessagePayload {
  return { type: "USER_MESSAGE", content };
}

export function createPong(echo: string): PongPayload {
  return { type: "PONG", echo };
}

export function createResume(lastSeq: number): ResumePayload {
  return { type: "RESUME", last_seq: lastSeq };
}

export function createToolAck(callId: string): ToolAckPayload {
  return { type: "TOOL_ACK", call_id: callId };
}

export function serializeClientMessage(message: ClientMessage): string {
  return JSON.stringify(message);
}
