"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { TraceEntry } from "@/types/trace";
import { filterTraceEntries } from "@/lib/trace/filter-trace-entries";
import { TraceRow } from "@/components/trace/trace-row";

interface TraceTimelineProps {
  entries: TraceEntry[];
  filterType: Parameters<typeof filterTraceEntries>[1];
  searchQuery: string;
  selectedTraceId: string | null;
  onSelect: (traceId: string | null) => void;
}

function estimateRowHeight(entry: TraceEntry | undefined, expanded: boolean): number {
  if (entry?.kind === "token_group" && expanded) {
    return 160;
  }

  return 72;
}

export function TraceTimeline({
  entries,
  filterType,
  searchQuery,
  selectedTraceId,
  onSelect,
}: TraceTimelineProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredEntries = useMemo(
    () => filterTraceEntries(entries, filterType, searchQuery),
    [entries, filterType, searchQuery],
  );

  const selectedEntry = entries.find((entry) => entry.id === selectedTraceId);
  const linkedCallId =
    selectedEntry?.kind === "tool_call" || selectedEntry?.kind === "tool_result"
      ? selectedEntry.callId
      : null;

  const virtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const entry = filteredEntries[index];
      return estimateRowHeight(entry, entry ? expandedIds.has(entry.id) : false);
    },
    overscan: 8,
  });

  const expandedKey = [...expandedIds].sort().join(",");

  useEffect(() => {
    virtualizer.measure();
  }, [expandedKey, filteredEntries.length, virtualizer]);

  const toggleExpand = (traceId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(traceId)) {
        next.delete(traceId);
      } else {
        next.add(traceId);
      }
      return next;
    });
  };

  if (filteredEntries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center">
        <p className="text-xs text-zinc-500">
          Protocol events will appear here as the agent runs.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-x-hidden overflow-y-auto px-3 py-3"
    >
      <div
        className="relative w-full min-w-0"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const entry = filteredEntries[virtualItem.index];
          if (!entry) {
            return null;
          }

          return (
            <div
              key={entry.id}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              className="absolute left-0 top-0 w-full min-w-0 pb-2"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <TraceRow
                entry={entry}
                selected={selectedTraceId === entry.id}
                linkedCallId={linkedCallId}
                expanded={expandedIds.has(entry.id)}
                onSelect={(traceId) => onSelect(traceId)}
                onToggleExpand={toggleExpand}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
