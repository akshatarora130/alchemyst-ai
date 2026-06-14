export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4747/ws";

export const BACKOFF_DELAYS_MS = [500, 1000, 2000, 4000, 10000] as const;

export const MAX_BACKOFF_MS = 10000;
