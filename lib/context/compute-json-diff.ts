import diff from "microdiff";
import type { ContextDiffChange } from "@/types/context";

function formatPath(path: (string | number)[]): string {
  if (path.length === 0) {
    return "$";
  }

  let formatted = "";

  for (const segment of path) {
    if (typeof segment === "number") {
      formatted += `[${segment}]`;
      continue;
    }

    formatted = formatted ? `${formatted}.${segment}` : segment;
  }

  return formatted;
}

export function isTreePathChanged(
  treePath: string,
  changedPaths: Set<string>,
): boolean {
  if (changedPaths.has(treePath)) {
    return true;
  }

  for (const diffPath of changedPaths) {
    if (diffPath === "$" && treePath === "$") {
      return true;
    }

    if (
      treePath.startsWith(`${diffPath}.`) ||
      treePath.startsWith(`${diffPath}[`) ||
      diffPath.startsWith(`${treePath}.`) ||
      diffPath.startsWith(`${treePath}[`)
    ) {
      return true;
    }
  }

  return false;
}

export function computeJsonDiff(
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
): ContextDiffChange[] {
  const changes = diff(previous, current);

  return changes.map((change) => {
    if (change.type === "CREATE") {
      return {
        kind: "add",
        path: formatPath(change.path),
        value: change.value,
      };
    }

    if (change.type === "REMOVE") {
      return {
        kind: "remove",
        path: formatPath(change.path),
        oldValue: change.oldValue,
      };
    }

    return {
      kind: "change",
      path: formatPath(change.path),
      value: change.value,
      oldValue: change.oldValue,
    };
  });
}
