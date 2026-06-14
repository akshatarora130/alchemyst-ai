import type { TraceEntry } from "@/types/trace";

interface TraceRowProps {
  entry: TraceEntry;
  selected: boolean;
  linkedCallId: string | null;
  expanded: boolean;
  onSelect: (traceId: string) => void;
  onToggleExpand: (traceId: string) => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function TraceRow({
  entry,
  selected,
  linkedCallId,
  expanded,
  onSelect,
  onToggleExpand,
}: TraceRowProps) {
  const isLinkedTool =
    (entry.kind === "tool_call" || entry.kind === "tool_result") &&
    linkedCallId === entry.callId;

  const rowClass = selected
    ? "border-sky-500 bg-sky-500/10"
    : isLinkedTool
      ? "border-zinc-600 bg-zinc-800/80"
      : "border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800";

  const indentClass =
    entry.kind === "tool_result"
      ? "ml-4 border-l-2 border-sky-500/40 pl-3"
      : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(entry.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(entry.id);
        }
      }}
      className={`min-w-0 w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 text-left transition-colors ${rowClass} ${indentClass}`}
    >
      <TraceRowContent
        entry={entry}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
}

function TraceRowContent({
  entry,
  expanded,
  onToggleExpand,
}: {
  entry: TraceEntry;
  expanded: boolean;
  onToggleExpand: (traceId: string) => void;
}) {
  switch (entry.kind) {
    case "token_group":
      return (
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-xs font-medium text-zinc-200">
              Streamed {entry.tokenCount} tokens (
              {formatDuration(entry.durationMs)})
            </p>
            <span className="shrink-0 text-[10px] text-zinc-500">
              seq {entry.seq}
            </span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(entry.id);
            }}
            className="mt-1 text-[11px] text-sky-400 hover:text-sky-300"
          >
            {expanded ? "Hide text" : "Show text"}
          </button>
          {expanded ? (
            <div className="mt-2 max-h-32 overflow-x-hidden overflow-y-auto rounded border border-zinc-700/70 bg-zinc-950/60 p-2">
              <p className="break-words whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-400">
                {entry.text}
              </p>
            </div>
          ) : null}
        </div>
      );
    case "tool_call":
      return (
        <div>
          <p className="text-xs font-medium text-sky-400">TOOL_CALL</p>
          <p className="mt-0.5 text-[11px] text-zinc-300">{entry.toolName}</p>
          <p className="text-[10px] text-zinc-500">seq {entry.seq}</p>
        </div>
      );
    case "tool_result":
      return (
        <div>
          <p className="text-xs font-medium text-emerald-400">TOOL_RESULT</p>
          <p className="mt-0.5 text-[11px] text-zinc-300">{entry.callId}</p>
          <p className="text-[10px] text-zinc-500">seq {entry.seq}</p>
        </div>
      );
    case "context_snapshot":
      return (
        <div>
          <p className="text-xs font-medium text-violet-400">CONTEXT</p>
          <p className="mt-0.5 text-[11px] text-zinc-300">{entry.contextId}</p>
        </div>
      );
    case "ping":
      return (
        <div>
          <p className="text-xs font-medium text-amber-400">PING</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            {entry.challenge || "(empty challenge)"}
          </p>
        </div>
      );
    case "pong":
      return (
        <div>
          <p className="text-xs font-medium text-emerald-400">PONG</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{entry.echo}</p>
        </div>
      );
    case "error":
      return (
        <div>
          <p className="text-xs font-medium text-red-400">ERROR</p>
          <p className="mt-0.5 text-[11px] text-zinc-300">{entry.message}</p>
        </div>
      );
    case "stream_end":
      return (
        <div>
          <p className="text-xs font-medium text-zinc-300">STREAM_END</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">{entry.streamId}</p>
        </div>
      );
    default:
      return null;
  }
}
