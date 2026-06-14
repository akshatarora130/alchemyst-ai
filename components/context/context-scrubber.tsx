"use client";

interface ContextScrubberProps {
  stepIndex: number;
  totalSteps: number;
  contextId: string | null;
  contextIds: string[];
  onStepChange: (stepIndex: number) => void;
  onContextChange: (contextId: string) => void;
}

export function ContextScrubber({
  stepIndex,
  totalSteps,
  contextId,
  contextIds,
  onStepChange,
  onContextChange,
}: ContextScrubberProps) {
  if (!contextId || totalSteps === 0) {
    return null;
  }

  const canGoBack = stepIndex > 0;
  const canGoForward = stepIndex < totalSteps - 1;

  return (
    <div className="shrink-0 space-y-2 border-b border-zinc-700 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        {contextIds.length > 1 ? (
          <select
            value={contextId}
            onChange={(event) => onContextChange(event.target.value)}
            className="min-w-0 flex-1 truncate rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
          >
            {contextIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        ) : (
          <p className="truncate text-xs font-medium text-zinc-200">
            {contextId}
          </p>
        )}
        <p className="shrink-0 text-[10px] text-zinc-500">
          {stepIndex + 1} / {totalSteps}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => onStepChange(stepIndex - 1)}
          className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 disabled:opacity-40"
        >
          Prev
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={stepIndex}
          onChange={(event) => onStepChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-sky-500"
        />
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => onStepChange(stepIndex + 1)}
          className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
