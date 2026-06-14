import type { ConnectionStatus } from "@/types/connection";
import type { SnapshotFrom } from "xstate";
import type { connectionMachine } from "@/machines/connection-machine";

export function getConnectionDisplayState(
  snapshot: SnapshotFrom<typeof connectionMachine>,
): {
  status: ConnectionStatus;
  isRecovering: boolean;
} {
  const isRecovering =
    snapshot.context.shouldSendResume ||
    snapshot.matches({ reconnecting: "waiting" });

  if (snapshot.matches("disconnected")) {
    return { status: "disconnected", isRecovering: false };
  }

  if (isRecovering) {
    return { status: "reconnecting", isRecovering: true };
  }

  if (snapshot.matches({ active: "connected" })) {
    return { status: "connected", isRecovering: false };
  }

  if (snapshot.matches({ active: "connecting" })) {
    return { status: "connecting", isRecovering: false };
  }

  return { status: "disconnected", isRecovering: false };
}
