import type { ChatMessage } from "@/types/chat";
import type { TraceEntry } from "@/types/trace";
import {
  createToolAck,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { applyServerEvent } from "@/lib/session/apply-server-event";
import {
  appendPongTraceEntry,
  appendTraceEntry,
} from "@/lib/trace/append-trace-entry";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import { notifySeqProcessed } from "@/lib/websocket/message-bridge";
import type { ServerMessage } from "@/types/protocol";

export interface ProcessReadyResult {
  messages: ChatMessage[];
  traceEntries: TraceEntry[];
}

export function processReadyMessages(
  messages: ChatMessage[],
  traceEntries: TraceEntry[],
  ready: ServerMessage[],
): ProcessReadyResult {
  let nextMessages = messages;
  let nextTrace = traceEntries;
  const now = Date.now();

  for (const message of ready) {
    const chatResult = applyServerEvent(nextMessages, message);
    nextMessages = chatResult.messages;
    nextTrace = appendTraceEntry(nextTrace, message, now);

    if (chatResult.toolAckCallId) {
      sendOnActiveSocket(
        serializeClientMessage(createToolAck(chatResult.toolAckCallId)),
      );
    }

    notifySeqProcessed(message.seq);
  }

  return { messages: nextMessages, traceEntries: nextTrace };
}

export function processPongSent(
  traceEntries: TraceEntry[],
  echo: string,
): TraceEntry[] {
  return appendPongTraceEntry(traceEntries, echo);
}
