import { createPong } from "@/lib/protocol/client-messages";
import type { PingMessage, PongPayload } from "@/types/protocol";

export function createPongForPing(ping: PingMessage): PongPayload | null {
  if (ping.challenge.length === 0) {
    return null;
  }

  return createPong(ping.challenge);
}
