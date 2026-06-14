import type { ContextDiffChange } from "@/types/context";

interface ContextDiffListProps {
  changes: ContextDiffChange[];
}

const KIND_STYLES: Record<ContextDiffChange["kind"], string> = {
  add: "text-emerald-400",
  remove: "text-red-400",
  change: "text-amber-400",
};

export function ContextDiffList({ changes }: ContextDiffListProps) {
  if (changes.length === 0) {
    return (
      <div className="border-b border-zinc-700 px-4 py-2">
        <p className="text-[11px] text-zinc-500">
          No changes from previous snapshot.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-28 overflow-y-auto overflow-x-hidden border-b border-zinc-700 px-4 py-2">
      <p className="mb-1 text-[10px] font-medium uppercase text-zinc-500">
        Diff
      </p>
      <ul className="space-y-1">
        {changes.map((change) => (
          <li
            key={`${change.kind}-${change.path}`}
            className="wrap-break-word text-[11px] leading-relaxed text-zinc-300"
          >
            <span className={`font-medium ${KIND_STYLES[change.kind]}`}>
              {change.kind}
            </span>{" "}
            <span className="font-mono text-zinc-400">{change.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
