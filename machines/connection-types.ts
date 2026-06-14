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
  | { type: "RETRY" }
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
  stateValue: string | object,
): ConnectionStatus {
  if (stateValue === "disconnected") {
    return "disconnected";
  }

  if (stateValue === "connecting") {
    return "connecting";
  }

  if (stateValue === "connected") {
    return "connected";
  }

  if (typeof stateValue === "object" && "reconnecting" in stateValue) {
    return "reconnecting";
  }

  return "disconnected";
}
