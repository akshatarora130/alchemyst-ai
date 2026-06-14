"use client";

import type { TraceFilterType } from "@/types/trace";

const FILTER_OPTIONS: { value: TraceFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "TOKEN", label: "Tokens" },
  { value: "TOOL_CALL", label: "Tool calls" },
  { value: "TOOL_RESULT", label: "Tool results" },
  { value: "CONTEXT_SNAPSHOT", label: "Context" },
  { value: "PING", label: "Ping" },
  { value: "PONG", label: "Pong" },
  { value: "ERROR", label: "Errors" },
];

interface TraceFilterBarProps {
  filterType: TraceFilterType;
  searchQuery: string;
  onFilterChange: (value: TraceFilterType) => void;
  onSearchChange: (value: string) => void;
}

export function TraceFilterBar({
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: TraceFilterBarProps) {
  return (
    <div className="shrink-0 space-y-2 border-b border-zinc-700 px-4 py-3">
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search trace…"
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((option) => {
          const isActive = filterType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded px-2 py-1 text-[11px] font-medium ${
                isActive
                  ? "bg-sky-500 text-zinc-950"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
