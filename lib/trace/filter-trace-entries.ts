import type { TraceEntry, TraceFilterType } from "@/types/trace";
import { traceEntryFilterType, traceEntrySearchText } from "@/types/trace";

export function filterTraceEntries(
  entries: TraceEntry[],
  filterType: TraceFilterType,
  searchQuery: string,
): TraceEntry[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    const matchesType =
      filterType === "all" || traceEntryFilterType(entry) === filterType;

    if (!matchesType) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return traceEntrySearchText(entry).toLowerCase().includes(normalizedQuery);
  });
}

export function findTraceIdByCallId(
  entries: TraceEntry[],
  callId: string,
  kind: "tool_call" | "tool_result",
): string | null {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry.kind === kind && entry.callId === callId) {
      return entry.id;
    }
  }

  return null;
}
