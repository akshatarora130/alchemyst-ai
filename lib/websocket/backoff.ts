import { BACKOFF_DELAYS_MS, MAX_BACKOFF_MS } from "@/lib/websocket/config";

export function getBackoffDelayMs(attempt: number): number {
  if (attempt < BACKOFF_DELAYS_MS.length) {
    return BACKOFF_DELAYS_MS[attempt];
  }

  return MAX_BACKOFF_MS;
}
