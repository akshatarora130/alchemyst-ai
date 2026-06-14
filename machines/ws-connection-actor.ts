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

export const wsConnectionActor = fromCallback<
  WsConnectionEvent,
  WsConnectionInput
>(({ sendBack, input }) => {
  const ws = new WebSocket(input.url);
  setActiveSocket(ws);

  ws.onopen = () => {
    if (input.resumeFromSeq !== null) {
      ws.send(serializeClientMessage(createResume(input.resumeFromSeq)));
    }

    sendBack({ type: "WS_OPEN" });
  };

  ws.onmessage = (event) => {
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
    setActiveSocket(null);
    ws.close();
  };
});
