import type { ToolSegment } from "@/types/chat";

interface ToolCallCardProps {
  segment: ToolSegment;
  highlighted?: boolean;
  onSelect?: () => void;
  isConnected?: boolean;
}

export function ToolCallCard({
  segment,
  highlighted = false,
  onSelect,
  isConnected = true,
}: ToolCallCardProps) {
  const argEntries = Object.entries(segment.args);
  const statusLabel = getToolStatusLabel(segment.status, isConnected);
  const statusStyle = getToolStatusStyle(segment.status, isConnected);

  return (
    <div
      data-call-id={segment.callId}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-md border bg-zinc-800 p-4 transition-colors ${
        highlighted
          ? "border-sky-500 ring-1 ring-sky-500/40"
          : "border-zinc-700"
      } ${onSelect ? "cursor-pointer hover:border-zinc-600" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-sky-400">{segment.toolName}</p>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </div>

      {argEntries.length > 0 ? (
        <dl className="mt-2 space-y-1">
          {argEntries.map(([key, value]) => (
            <div key={key} className="text-xs">
              <dt className="inline text-zinc-500">{key}: </dt>
              <dd className="inline font-mono text-zinc-300">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {segment.result ? (
        <div className="mt-2 border-t border-zinc-700 pt-2">
          <p className="text-[10px] font-medium uppercase text-zinc-500">
            Result
          </p>
          <pre className="mt-1 overflow-x-auto text-xs text-zinc-300">
            {JSON.stringify(segment.result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function getToolStatusLabel(
  status: ToolSegment["status"],
  isConnected: boolean,
): string {
  if (status === "complete") {
    return "Done";
  }

  return isConnected ? "Running" : "Waiting";
}

function getToolStatusStyle(
  status: ToolSegment["status"],
  isConnected: boolean,
): string {
  if (status === "complete") {
    return "bg-emerald-500/20 text-emerald-400";
  }

  return isConnected
    ? "bg-amber-500/20 text-amber-400"
    : "bg-violet-500/20 text-violet-300";
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
