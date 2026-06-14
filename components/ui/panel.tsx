import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  title,
  description,
  children,
  className = "",
  bodyClassName = "",
}: PanelProps) {
  return (
    <section
      className={`flex min-h-0 flex-1 flex-col rounded-lg border border-zinc-700 bg-zinc-900 ${className}`}
    >
      <header className="shrink-0 border-b border-zinc-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
        ) : null}
      </header>
      <div className={`min-h-0 flex-1 overflow-auto p-4 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
