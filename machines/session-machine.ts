import { assign, setup } from "xstate";
import { parseServerMessage } from "@/lib/protocol/parse-server-message";
import {
  createSeqBuffer,
  ingestServerMessage,
} from "@/lib/protocol/seq-buffer";
import {
  setActiveContextId,
  setContextStep,
} from "@/lib/context/apply-context-snapshot";
import {
  processPongSent,
  processReadyMessages,
} from "@/lib/session/process-ready-messages";
import { createUserChatMessage } from "@/types/chat";
import { createInitialContextState } from "@/types/context";
import { notifySeqProcessed } from "@/lib/websocket/message-bridge";
import type { SessionContext, SessionEvent } from "@/machines/session-types";

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
    traceEntries: [],
    selectedTraceId: null,
    contextState: createInitialContextState(),
    turnIndex: 0,
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
            const processed = processReadyMessages(
              context.messages,
              context.traceEntries,
              context.contextState,
              context.turnIndex,
              ingested.ready,
            );

            return {
              seqBuffer: ingested.state,
              messages: processed.messages,
              traceEntries: processed.traceEntries,
              contextState: processed.contextState,
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
                turnIndex: context.turnIndex + 1,
              };
            }),
            () => {
              notifySeqProcessed(0);
            },
          ],
        },
        PONG_SENT: {
          actions: assign(({ context, event }) => {
            if (event.type !== "PONG_SENT") {
              return {};
            }

            return {
              traceEntries: processPongSent(context.traceEntries, event.echo),
            };
          }),
        },
        SELECT_TRACE: {
          actions: assign({
            selectedTraceId: ({ event }) =>
              event.type === "SELECT_TRACE" ? event.traceId : null,
          }),
        },
        SET_CONTEXT_STEP: {
          actions: assign(({ context, event }) => {
            if (event.type !== "SET_CONTEXT_STEP") {
              return {};
            }

            return {
              contextState: setContextStep(
                context.contextState,
                event.stepIndex,
              ),
            };
          }),
        },
        SET_ACTIVE_CONTEXT: {
          actions: assign(({ context, event }) => {
            if (event.type !== "SET_ACTIVE_CONTEXT") {
              return {};
            }

            return {
              contextState: setActiveContextId(
                context.contextState,
                event.contextId,
              ),
            };
          }),
        },
      },
    },
  },
});
