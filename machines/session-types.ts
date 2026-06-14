import type { ChatMessage } from "@/types/chat";
import type { SeqBufferState } from "@/lib/protocol/seq-buffer";

export interface SessionContext {
  messages: ChatMessage[];
  seqBuffer: SeqBufferState;
}

export type SessionEvent =
  | { type: "WS_RAW"; raw: string }
  | { type: "SEND_USER"; content: string };
