"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useAgent } from "@/providers/agent-provider";
import type { TraceFilterType } from "@/types/trace";
import { TraceFilterBar } from "@/components/trace/trace-filter-bar";
import { TraceTimeline } from "@/components/trace/trace-timeline";

export function TracePanel() {
  const { traceEntries, selectedTraceId, selectTrace } = useAgent();
  const [filterType, setFilterType] = useState<TraceFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCallId = useMemo(() => {
    const selected = traceEntries.find((entry) => entry.id === selectedTraceId);
    if (selected?.kind === "tool_call" || selected?.kind === "tool_result") {
      return selected.callId;
    }
    return null;
  }, [traceEntries, selectedTraceId]);

  useEffect(() => {
    if (!selectedCallId) {
      return;
    }

    const element = document.querySelector(
      `[data-call-id="${selectedCallId}"]`,
    );
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedCallId]);

  return (
    <Panel
      title="Agent Trace"
      description="Protocol events in real time"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      <TraceFilterBar
        filterType={filterType}
        searchQuery={searchQuery}
        onFilterChange={setFilterType}
        onSearchChange={setSearchQuery}
      />
      <div className="min-h-0 flex-1">
        <TraceTimeline
          entries={traceEntries}
          filterType={filterType}
          searchQuery={searchQuery}
          selectedTraceId={selectedTraceId}
          onSelect={selectTrace}
        />
      </div>
    </Panel>
  );
}
