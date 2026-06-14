export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting…",
  connected: "Connected",
  reconnecting: "Reconnecting…",
};
