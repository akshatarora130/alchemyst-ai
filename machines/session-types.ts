import type { ChatMessage } from "@/types/chat";
import type { ContextInspectorState } from "@/types/context";
import type { SeqBufferState } from "@/lib/protocol/seq-buffer";
import type { TraceEntry } from "@/types/trace";
import { createInitialContextState } from "@/types/context";

export interface SessionContext {
  messages: ChatMessage[];
  seqBuffer: SeqBufferState;
  traceEntries: TraceEntry[];
  selectedTraceId: string | null;
  contextState: ContextInspectorState;
  turnIndex: number;
}

export type SessionEvent =
  | { type: "WS_RAW"; raw: string }
  | { type: "SEND_USER"; content: string }
  | { type: "PONG_SENT"; echo: string }
  | { type: "SELECT_TRACE"; traceId: string | null }
  | { type: "SET_CONTEXT_STEP"; stepIndex: number }
  | { type: "SET_ACTIVE_CONTEXT"; contextId: string };

export { createInitialContextState };
