import { assign, setup } from "xstate";
import { getBackoffDelayMs } from "@/lib/websocket/backoff";
import { WS_URL } from "@/lib/websocket/config";
import { serializeClientMessage } from "@/lib/protocol/client-messages";
import { parseServerMessage } from "@/lib/protocol/parse-server-message";
import { createPongForPing } from "@/lib/websocket/ping-handler";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import type {
  ConnectionContext,
  ConnectionEvent,
  WsConnectionInput,
} from "@/machines/connection-types";
import { wsConnectionActor } from "@/machines/ws-connection-actor";

function getResumeFromSeq(context: ConnectionContext): number | null {
  if (!context.shouldSendResume) {
    return null;
  }

  return context.lastProcessedSeq;
}

function handleServerMessage({ event }: { event: ConnectionEvent }) {
  if (event.type !== "WS_MESSAGE") {
    return;
  }

  const message = parseServerMessage(event.raw);
  if (!message || message.type !== "PING") {
    return;
  }

  const pong = createPongForPing(message);
  if (!pong) {
    return;
  }

  sendOnActiveSocket(serializeClientMessage(pong));
}

export const connectionMachine = setup({
  types: {
    context: {} as ConnectionContext,
    events: {} as ConnectionEvent,
  },
  actors: {
    wsConnection: wsConnectionActor,
  },
  delays: {
    reconnectDelay: ({ context }) =>
      getBackoffDelayMs(context.reconnectAttempt),
  },
}).createMachine({
  id: "connection",
  initial: "disconnected",
  context: {
    url: WS_URL,
    lastProcessedSeq: 0,
    reconnectAttempt: 0,
    shouldSendResume: false,
  },
  states: {
    disconnected: {
      entry: assign({
        reconnectAttempt: 0,
        shouldSendResume: false,
      }),
      on: {
        CONNECT: "connecting",
      },
    },
    connecting: {
      invoke: {
        id: "socket",
        src: "wsConnection",
        input: ({ context }): WsConnectionInput => ({
          url: context.url,
          resumeFromSeq: getResumeFromSeq(context),
        }),
      },
      on: {
        WS_OPEN: {
          target: "connected",
          actions: assign({
            reconnectAttempt: 0,
            shouldSendResume: false,
          }),
        },
        WS_CLOSE: {
          target: "reconnecting",
          actions: assign({
            reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
          }),
        },
        WS_ERROR: {
          target: "reconnecting",
          actions: assign({
            reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
          }),
        },
        DISCONNECT: "disconnected",
      },
    },
    connected: {
      on: {
        WS_MESSAGE: {
          actions: handleServerMessage,
        },
        WS_CLOSE: {
          target: "reconnecting",
          actions: assign({
            shouldSendResume: true,
            reconnectAttempt: 0,
          }),
        },
        WS_ERROR: {
          target: "reconnecting",
          actions: assign({
            shouldSendResume: true,
            reconnectAttempt: 0,
          }),
        },
        DISCONNECT: "disconnected",
        UPDATE_LAST_SEQ: {
          actions: assign({
            lastProcessedSeq: ({ event }) =>
              event.type === "UPDATE_LAST_SEQ" ? event.seq : 0,
          }),
        },
      },
    },
    reconnecting: {
      initial: "waiting",
      states: {
        waiting: {
          after: {
            reconnectDelay: "connecting",
          },
          on: {
            DISCONNECT: "#connection.disconnected",
          },
        },
        connecting: {
          invoke: {
            id: "socket",
            src: "wsConnection",
            input: ({ context }): WsConnectionInput => ({
              url: context.url,
              resumeFromSeq: getResumeFromSeq(context),
            }),
          },
          on: {
            WS_OPEN: {
              target: "#connection.connected",
              actions: assign({
                reconnectAttempt: 0,
                shouldSendResume: false,
              }),
            },
            WS_CLOSE: {
              target: "waiting",
              actions: assign({
                reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
              }),
            },
            WS_ERROR: {
              target: "waiting",
              actions: assign({
                reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
              }),
            },
            DISCONNECT: "#connection.disconnected",
          },
        },
      },
      on: {
        DISCONNECT: "disconnected",
      },
    },
  },
  on: {
    UPDATE_LAST_SEQ: {
      actions: assign({
        lastProcessedSeq: ({ event }) =>
          event.type === "UPDATE_LAST_SEQ" ? event.seq : 0,
      }),
    },
  },
});
