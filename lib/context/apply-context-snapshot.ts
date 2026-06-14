import {
  ContextInspectorState,
  createInitialContextState,
  getContextSnapshots,
  getStepIndex,
} from "@/types/context";
import type { ContextSnapshotMessage } from "@/types/protocol";

export function applyContextSnapshot(
  state: ContextInspectorState,
  message: ContextSnapshotMessage,
  turnIndex: number,
): ContextInspectorState {
  const record = {
    id: `ctx-${turnIndex}-${message.seq}`,
    contextId: message.context_id,
    seq: message.seq,
    data: message.data,
    receivedAt: Date.now(),
  };

  const previousHistory = getContextSnapshots(state, message.context_id);
  const previousStep = getStepIndex(state, message.context_id);
  const wasAtLatest =
    previousHistory.length === 0 || previousStep === previousHistory.length - 1;

  const snapshots = [...state.snapshots, record];
  const history = getContextSnapshots(
    { ...state, snapshots },
    message.context_id,
  );

  return {
    snapshots,
    activeContextId: message.context_id,
    stepIndexByContextId: {
      ...state.stepIndexByContextId,
      [message.context_id]: wasAtLatest
        ? history.length - 1
        : previousStep,
    },
  };
}

export function resetContextState(): ContextInspectorState {
  return createInitialContextState();
}

export function setContextStep(
  state: ContextInspectorState,
  stepIndex: number,
): ContextInspectorState {
  if (!state.activeContextId) {
    return state;
  }

  const history = getContextSnapshots(state, state.activeContextId);
  const clamped = Math.max(0, Math.min(stepIndex, history.length - 1));

  return {
    ...state,
    stepIndexByContextId: {
      ...state.stepIndexByContextId,
      [state.activeContextId]: clamped,
    },
  };
}

export function setActiveContextId(
  state: ContextInspectorState,
  contextId: string,
): ContextInspectorState {
  const history = getContextSnapshots(state, contextId);
  if (history.length === 0) {
    return state;
  }

  return {
    ...state,
    activeContextId: contextId,
    stepIndexByContextId: {
      ...state.stepIndexByContextId,
      [contextId]:
        state.stepIndexByContextId[contextId] ?? history.length - 1,
    },
  };
}
