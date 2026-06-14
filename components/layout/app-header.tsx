import type { ConnectionStatus } from "@/types/connection";
import { ConnectionStatusBadge } from "@/components/layout/connection-status";

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
}

export function AppHeader({ connectionStatus }: AppHeaderProps) {
  return (
    <header className="shrink-0 border-b border-zinc-700 bg-zinc-900 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 sm:text-lg">
            Agent Console
          </h1>
          <p className="text-xs text-zinc-400 sm:text-sm">
            Real-time agent streaming & protocol trace
          </p>
        </div>
        <ConnectionStatusBadge status={connectionStatus} />
      </div>
    </header>
  );
}
