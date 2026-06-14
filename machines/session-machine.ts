import { assign, setup } from "xstate";
import {
  createToolAck,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { parseServerMessage } from "@/lib/protocol/parse-server-message";
import {
  createSeqBuffer,
  ingestServerMessage,
} from "@/lib/protocol/seq-buffer";
import { applyServerEvent } from "@/lib/session/apply-server-event";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import { notifySeqProcessed } from "@/lib/websocket/message-bridge";
import type { SessionContext, SessionEvent } from "@/machines/session-types";
import { createUserChatMessage } from "@/types/chat";

function processReadyMessages(
  messages: SessionContext["messages"],
  ready: ReturnType<typeof ingestServerMessage>["ready"],
): SessionContext["messages"] {
  let nextMessages = messages;

  for (const message of ready) {
    const result = applyServerEvent(nextMessages, message);
    nextMessages = result.messages;

    if (result.toolAckCallId) {
      sendOnActiveSocket(
        serializeClientMessage(createToolAck(result.toolAckCallId)),
      );
    }

    notifySeqProcessed(message.seq);
  }

  return nextMessages;
}

export const sessionMachine = setup({
  types: {
    context: {} as SessionContext,
    events: {} as SessionEvent,
  },
}).createMachine({
  id: "session",
  initial: "idle",
  context: {
    messages: [],
    seqBuffer: createSeqBuffer(0),
  },
  states: {
    idle: {
      on: {
        WS_RAW: {
          actions: assign(({ context, event }) => {
            if (event.type !== "WS_RAW") {
              return {};
            }

            const parsed = parseServerMessage(event.raw);
            if (!parsed) {
              return {};
            }

            const ingested = ingestServerMessage(context.seqBuffer, parsed);

            return {
              seqBuffer: ingested.state,
              messages: processReadyMessages(context.messages, ingested.ready),
            };
          }),
        },
        SEND_USER: {
          actions: [
            assign(({ context, event }) => {
              if (event.type !== "SEND_USER") {
                return {};
              }

              return {
                messages: [
                  ...context.messages,
                  createUserChatMessage(event.content),
                ],
                seqBuffer: createSeqBuffer(0),
              };
            }),
            () => {
              notifySeqProcessed(0);
            },
          ],
        },
      },
    },
  },
});
