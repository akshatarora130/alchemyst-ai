import { fromCallback } from "xstate";
import {
  createResume,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { setActiveSocket } from "@/lib/websocket/active-socket";
import type {
  WsConnectionEvent,
  WsConnectionInput,
} from "@/machines/connection-types";

const WATCHDOG_INTERVAL_MS = 5_000;
const WATCHDOG_TIMEOUT_MS = 20_000;

export const wsConnectionActor = fromCallback<
  WsConnectionEvent,
  WsConnectionInput
>(({ sendBack, input }) => {
  const ws = new WebSocket(input.url);
  setActiveSocket(ws);

  let lastActivityAt = Date.now();

  const markActivity = () => {
    lastActivityAt = Date.now();
  };

  const watchdog = setInterval(() => {
    const idleForMs = Date.now() - lastActivityAt;

    if (ws.readyState === WebSocket.OPEN && idleForMs >= WATCHDOG_TIMEOUT_MS) {
      ws.close();
    }
  }, WATCHDOG_INTERVAL_MS);

  ws.onopen = () => {
    markActivity();

    if (input.resumeFromSeq !== null) {
      ws.send(serializeClientMessage(createResume(input.resumeFromSeq)));
    }

    sendBack({ type: "WS_OPEN" });
  };

  ws.onmessage = (event) => {
    markActivity();

    if (typeof event.data !== "string") {
      return;
    }

    sendBack({ type: "WS_MESSAGE", raw: event.data });
  };

  ws.onclose = () => {
    sendBack({ type: "WS_CLOSE" });
  };

  ws.onerror = () => {
    sendBack({ type: "WS_ERROR" });
  };

  return () => {
    clearInterval(watchdog);
    setActiveSocket(null);
    ws.close();
  };
});
