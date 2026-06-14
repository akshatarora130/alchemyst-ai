import type { ConnectionStatus } from "@/types/connection";

export interface ConnectionContext {
  url: string;
  lastProcessedSeq: number;
  reconnectAttempt: number;
  shouldSendResume: boolean;
}

export type ConnectionEvent =
  | { type: "CONNECT" }
  | { type: "DISCONNECT" }
  | { type: "WS_OPEN" }
  | { type: "WS_CLOSE" }
  | { type: "WS_ERROR" }
  | { type: "WS_MESSAGE"; raw: string }
  | { type: "UPDATE_LAST_SEQ"; seq: number };

export interface WsConnectionInput {
  url: string;
  resumeFromSeq: number | null;
}

export type WsConnectionEvent =
  | { type: "WS_OPEN" }
  | { type: "WS_CLOSE" }
  | { type: "WS_ERROR" }
  | { type: "WS_MESSAGE"; raw: string };

export function mapMachineStateToStatus(
  snapshot: Pick<ConnectionContext, "shouldSendResume"> & {
    value: string | object;
  },
): ConnectionStatus {
  const stateValue = snapshot.value;

  if (stateValue === "disconnected") {
    return "disconnected";
  }

  if (typeof stateValue === "object" && "reconnecting" in stateValue) {
    return "reconnecting";
  }

  if (typeof stateValue === "object" && "active" in stateValue) {
    if (stateValue.active === "connected") {
      return "connected";
    }

    return snapshot.shouldSendResume ? "reconnecting" : "connecting";
  }

  return "disconnected";
}
