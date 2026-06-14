"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  buildTreeLines,
  defaultExpandedPaths,
} from "@/lib/context/build-tree-lines";
import { isTreePathChanged } from "@/lib/context/compute-json-diff";
import type { TreeLine, TreeValueType } from "@/types/context";

interface ContextTreeViewProps {
  viewKey: string;
  data: Record<string, unknown>;
  changedPaths: Set<string>;
}

const VALUE_COLORS: Record<TreeValueType, string> = {
  object: "text-zinc-300",
  array: "text-violet-300",
  string: "text-emerald-300",
  number: "text-amber-300",
  boolean: "text-sky-300",
  null: "text-zinc-500",
};

export function ContextTreeView({
  viewKey,
  data,
  changedPaths,
}: ContextTreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() =>
    defaultExpandedPaths(data),
  );

  const contextId = viewKey.split(":")[0] ?? viewKey;

  useEffect(() => {
    setExpandedPaths(defaultExpandedPaths(data));
  }, [contextId]);

  const lines = useMemo(
    () => buildTreeLines(data, expandedPaths),
    [data, expandedPaths],
  );

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 12,
  });

  const expandedKey = [...expandedPaths].sort().join(",");

  useEffect(() => {
    virtualizer.measure();
  }, [expandedKey, lines.length, virtualizer]);

  const togglePath = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div
      ref={parentRef}
      className="h-full overflow-x-hidden overflow-y-auto px-2 py-2"
    >
      <div
        className="relative w-full min-w-0"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const line = lines[virtualItem.index];
          if (!line) {
            return null;
          }

          const isChanged = isTreePathChanged(line.path, changedPaths);

          return (
            <TreeLineRow
              key={line.id}
              line={line}
              isChanged={isChanged}
              onToggle={togglePath}
              measureRef={virtualizer.measureElement}
              index={virtualItem.index}
              translateY={virtualItem.start}
            />
          );
        })}
      </div>
    </div>
  );
}

function TreeLineRow({
  line,
  isChanged,
  onToggle,
  measureRef,
  index,
  translateY,
}: {
  line: TreeLine;
  isChanged: boolean;
  onToggle: (path: string) => void;
  measureRef: (element: Element | null) => void;
  index: number;
  translateY: number;
}) {
  return (
    <div
      ref={measureRef}
      data-index={index}
      className={`absolute left-0 top-0 w-full min-w-0 font-mono text-[11px] ${
        isChanged ? "rounded bg-amber-500/10" : ""
      }`}
      style={{
        transform: `translateY(${translateY}px)`,
        paddingLeft: `${line.depth * 12}px`,
      }}
    >
      {line.isExpandable ? (
        <button
          type="button"
          onClick={() => onToggle(line.path)}
          className="mr-1 inline text-zinc-500 hover:text-zinc-300"
        >
          ▶
        </button>
      ) : (
        <span className="mr-3 inline text-transparent">▶</span>
      )}
      <span className="text-zinc-400">{line.keyLabel}</span>
      {line.keyLabel !== "root" ? (
        <span className="text-zinc-600">: </span>
      ) : null}
      <span className={`break-all ${VALUE_COLORS[line.valueType]}`}>
        {line.valuePreview}
      </span>
    </div>
  );
}
