import type { ChatMessage } from "@/types/chat";
import type { ContextInspectorState } from "@/types/context";
import type { TraceEntry } from "@/types/trace";
import {
  createToolAck,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { applyContextSnapshot } from "@/lib/context/apply-context-snapshot";
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
  contextState: ContextInspectorState;
}

export function processReadyMessages(
  messages: ChatMessage[],
  traceEntries: TraceEntry[],
  contextState: ContextInspectorState,
  turnIndex: number,
  ready: ServerMessage[],
): ProcessReadyResult {
  let nextMessages = messages;
  let nextTrace = traceEntries;
  let nextContext = contextState;
  const now = Date.now();

  for (const message of ready) {
    const chatResult = applyServerEvent(nextMessages, message);
    nextMessages = chatResult.messages;
    nextTrace = appendTraceEntry(nextTrace, message, turnIndex, now);

    if (message.type === "CONTEXT_SNAPSHOT") {
      nextContext = applyContextSnapshot(nextContext, message, turnIndex);
    }

    if (chatResult.toolAckCallId) {
      sendOnActiveSocket(
        serializeClientMessage(createToolAck(chatResult.toolAckCallId)),
      );
    }

    notifySeqProcessed(message.seq);
  }

  return {
    messages: nextMessages,
    traceEntries: nextTrace,
    contextState: nextContext,
  };
}

export function processPongSent(
  traceEntries: TraceEntry[],
  echo: string,
): TraceEntry[] {
  return appendPongTraceEntry(traceEntries, echo);
}
