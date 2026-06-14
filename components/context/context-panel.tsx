"use client";

import { useMemo } from "react";
import { Panel } from "@/components/ui/panel";
import { useAgent } from "@/providers/agent-provider";
import { computeJsonDiff } from "@/lib/context/compute-json-diff";
import {
  getActiveSnapshot,
  getContextIds,
  getContextSnapshots,
  getPreviousSnapshot,
  getStepIndex,
} from "@/types/context";
import { ContextScrubber } from "@/components/context/context-scrubber";
import { ContextDiffList } from "@/components/context/context-diff-list";
import { ContextTreeView } from "@/components/context/context-tree-view";

export function ContextPanel() {
  const { contextState, setContextStep, setActiveContext } = useAgent();

  const activeSnapshot = getActiveSnapshot(contextState);
  const previousSnapshot = getPreviousSnapshot(contextState);
  const contextIds = getContextIds(contextState);
  const stepIndex = contextState.activeContextId
    ? getStepIndex(contextState, contextState.activeContextId)
    : 0;
  const history = contextState.activeContextId
    ? getContextSnapshots(contextState, contextState.activeContextId)
    : [];

  const diffChanges = useMemo(() => {
    if (!activeSnapshot || !previousSnapshot) {
      return [];
    }

    return computeJsonDiff(previousSnapshot.data, activeSnapshot.data);
  }, [activeSnapshot, previousSnapshot]);

  const changedPaths = useMemo(() => {
    return new Set(diffChanges.map((change) => change.path));
  }, [diffChanges]);

  const treeViewKey = activeSnapshot
    ? `${activeSnapshot.contextId}:${stepIndex}`
    : "empty";

  return (
    <Panel
      title="Context Inspector"
      description="Agent context snapshots and diffs"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      <ContextScrubber
        stepIndex={stepIndex}
        totalSteps={history.length}
        contextId={contextState.activeContextId}
        contextIds={contextIds}
        onStepChange={setContextStep}
        onContextChange={setActiveContext}
      />

      {activeSnapshot ? (
        <>
          <ContextDiffList changes={diffChanges} />
          <div className="min-h-0 flex-1">
            <ContextTreeView
              viewKey={treeViewKey}
              data={activeSnapshot.data}
              changedPaths={changedPaths}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="text-xs text-zinc-500">
            Context snapshots appear when the agent sends CONTEXT_SNAPSHOT
            events.
          </p>
        </div>
      )}
    </Panel>
  );
}
