import { assign, setup } from "xstate";
import { getBackoffDelayMs } from "@/lib/websocket/backoff";
import { WS_URL } from "@/lib/websocket/config";
import { serializeClientMessage } from "@/lib/protocol/client-messages";
import { parseServerMessage } from "@/lib/protocol/parse-server-message";
import { createPongForPing } from "@/lib/websocket/ping-handler";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import { forwardAgentMessage } from "@/lib/websocket/message-bridge";
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
  if (!message) {
    return;
  }

  if (message.type === "PING") {
    const pong = createPongForPing(message);
    if (pong) {
      sendOnActiveSocket(serializeClientMessage(pong));
    }
  }

  forwardAgentMessage(event.raw);
}

const socketInvoke = {
  id: "socket",
  src: "wsConnection" as const,
  input: ({ context }: { context: ConnectionContext }): WsConnectionInput => ({
    url: context.url,
    resumeFromSeq: getResumeFromSeq(context),
  }),
};

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
        CONNECT: "active",
      },
    },
    active: {
      invoke: socketInvoke,
      initial: "connecting",
      states: {
        connecting: {
          on: {
            WS_OPEN: {
              target: "connected",
              actions: assign({
                reconnectAttempt: 0,
                shouldSendResume: false,
              }),
            },
            WS_CLOSE: {
              target: "#connection.reconnecting",
              actions: assign({
                reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
              }),
            },
            WS_ERROR: {
              target: "#connection.reconnecting",
              actions: assign({
                reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
              }),
            },
          },
        },
        connected: {
          on: {
            WS_MESSAGE: {
              actions: handleServerMessage,
            },
            WS_CLOSE: {
              target: "#connection.reconnecting",
              actions: assign({
                shouldSendResume: true,
                reconnectAttempt: 0,
              }),
            },
            WS_ERROR: {
              target: "#connection.reconnecting",
              actions: assign({
                shouldSendResume: true,
                reconnectAttempt: 0,
              }),
            },
          },
        },
      },
      on: {
        DISCONNECT: "disconnected",
      },
    },
    reconnecting: {
      initial: "waiting",
      states: {
        waiting: {
          after: {
            reconnectDelay: "#connection.active.connecting",
          },
          on: {
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
