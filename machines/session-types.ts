import type { ChatMessage } from "@/types/chat";
import type { SeqBufferState } from "@/lib/protocol/seq-buffer";
import type { TraceEntry } from "@/types/trace";

export interface SessionContext {
  messages: ChatMessage[];
  seqBuffer: SeqBufferState;
  traceEntries: TraceEntry[];
  selectedTraceId: string | null;
}

export type SessionEvent =
  | { type: "WS_RAW"; raw: string }
  | { type: "SEND_USER"; content: string }
  | { type: "PONG_SENT"; echo: string }
  | { type: "SELECT_TRACE"; traceId: string | null };
