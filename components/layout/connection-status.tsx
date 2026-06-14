import type { ConnectionStatus } from "@/types/connection";
import { CONNECTION_STATUS_LABELS } from "@/types/connection";

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

const STATUS_STYLES: Record<ConnectionStatus, string> = {
  disconnected: "bg-zinc-700 text-zinc-300",
  connecting: "bg-amber-500/20 text-amber-400",
  connected: "bg-emerald-500/20 text-emerald-400",
  reconnecting: "bg-amber-500/20 text-amber-400",
};

const STATUS_DOTS: Record<ConnectionStatus, string> = {
  disconnected: "bg-zinc-500",
  connecting: "bg-amber-500",
  connected: "bg-emerald-500",
  reconnecting: "bg-amber-500",
};

export function ConnectionStatusBadge({ status }: ConnectionStatusProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOTS[status]} ${status === "connecting" || status === "reconnecting" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      {CONNECTION_STATUS_LABELS[status]}
    </div>
  );
}
