export interface ContextSnapshotRecord {
  id: string;
  contextId: string;
  seq: number;
  data: Record<string, unknown>;
  receivedAt: number;
}

export type ContextDiffKind = "add" | "remove" | "change";

export interface ContextDiffChange {
  kind: ContextDiffKind;
  path: string;
  value?: unknown;
  oldValue?: unknown;
}

export interface ContextInspectorState {
  snapshots: ContextSnapshotRecord[];
  activeContextId: string | null;
  stepIndexByContextId: Record<string, number>;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type TreeValueType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null";

export interface TreeLine {
  id: string;
  path: string;
  depth: number;
  keyLabel: string;
  valuePreview: string;
  valueType: TreeValueType;
  isExpandable: boolean;
}

export function createInitialContextState(): ContextInspectorState {
  return {
    snapshots: [],
    activeContextId: null,
    stepIndexByContextId: {},
  };
}

export function getContextSnapshots(
  state: ContextInspectorState,
  contextId: string,
): ContextSnapshotRecord[] {
  return state.snapshots.filter((snapshot) => snapshot.contextId === contextId);
}

export function getContextIds(state: ContextInspectorState): string[] {
  const ids = new Set<string>();

  for (const snapshot of state.snapshots) {
    ids.add(snapshot.contextId);
  }

  return [...ids];
}

export function getStepIndex(
  state: ContextInspectorState,
  contextId: string,
): number {
  const history = getContextSnapshots(state, contextId);

  if (history.length === 0) {
    return 0;
  }

  const stored = state.stepIndexByContextId[contextId] ?? history.length - 1;
  return Math.max(0, Math.min(stored, history.length - 1));
}

export function getActiveSnapshot(
  state: ContextInspectorState,
): ContextSnapshotRecord | null {
  if (!state.activeContextId) {
    return null;
  }

  const history = getContextSnapshots(state, state.activeContextId);
  return history[getStepIndex(state, state.activeContextId)] ?? null;
}

export function getPreviousSnapshot(
  state: ContextInspectorState,
): ContextSnapshotRecord | null {
  if (!state.activeContextId) {
    return null;
  }

  const stepIndex = getStepIndex(state, state.activeContextId);
  if (stepIndex === 0) {
    return null;
  }

  const history = getContextSnapshots(state, state.activeContextId);
  return history[stepIndex - 1] ?? null;
}
