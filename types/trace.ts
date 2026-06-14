import type { ServerMessageType } from "@/types/protocol";

export type TraceFilterType = "all" | ServerMessageType | "PONG";

export interface TokenGroupTraceEntry {
  kind: "token_group";
  id: string;
  seq: number;
  endSeq: number;
  streamId: string;
  tokenCount: number;
  text: string;
  startedAt: number;
  durationMs: number;
}

export interface ToolCallTraceEntry {
  kind: "tool_call";
  id: string;
  seq: number;
  callId: string;
  toolName: string;
  streamId: string;
}

export interface ToolResultTraceEntry {
  kind: "tool_result";
  id: string;
  seq: number;
  callId: string;
  streamId: string;
}

export interface ContextTraceEntry {
  kind: "context_snapshot";
  id: string;
  seq: number;
  contextId: string;
}

export interface PingTraceEntry {
  kind: "ping";
  id: string;
  seq: number;
  challenge: string;
}

export interface PongTraceEntry {
  kind: "pong";
  id: string;
  echo: string;
  sentAt: number;
}

export interface ErrorTraceEntry {
  kind: "error";
  id: string;
  seq: number;
  code: string;
  message: string;
}

export interface StreamEndTraceEntry {
  kind: "stream_end";
  id: string;
  seq: number;
  streamId: string;
}

export type TraceEntry =
  | TokenGroupTraceEntry
  | ToolCallTraceEntry
  | ToolResultTraceEntry
  | ContextTraceEntry
  | PingTraceEntry
  | PongTraceEntry
  | ErrorTraceEntry
  | StreamEndTraceEntry;

export function traceEntryFilterType(entry: TraceEntry): TraceFilterType {
  if (entry.kind === "token_group") {
    return "TOKEN";
  }

  if (entry.kind === "pong") {
    return "PONG";
  }

  if (entry.kind === "tool_call") {
    return "TOOL_CALL";
  }

  if (entry.kind === "tool_result") {
    return "TOOL_RESULT";
  }

  return entry.kind.toUpperCase() as TraceFilterType;
}

export function traceEntrySearchText(entry: TraceEntry): string {
  switch (entry.kind) {
    case "token_group":
      return entry.text;
    case "tool_call":
      return `${entry.toolName} ${entry.callId}`;
    case "tool_result":
      return entry.callId;
    case "context_snapshot":
      return entry.contextId;
    case "ping":
      return entry.challenge;
    case "pong":
      return entry.echo;
    case "error":
      return `${entry.code} ${entry.message}`;
    case "stream_end":
      return entry.streamId;
    default:
      return "";
  }
}
