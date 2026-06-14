import type { JsonValue, TreeLine, TreeValueType } from "@/types/context";

function getValueType(value: JsonValue): TreeValueType {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (typeof value === "object") {
    return "object";
  }

  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  return "string";
}

function previewValue(value: JsonValue, valueType: TreeValueType): string {
  if (valueType === "object") {
    return `{${Object.keys(value as Record<string, JsonValue>).length} keys}`;
  }

  if (valueType === "array") {
    return `[${(value as JsonValue[]).length} items]`;
  }

  if (valueType === "string") {
    const text = value as string;
    return text.length > 80 ? `"${text.slice(0, 80)}…"` : `"${text}"`;
  }

  return String(value);
}

function isPathExpanded(path: string, expandedPaths: Set<string>): boolean {
  if (path === "") {
    return expandedPaths.has("$");
  }

  return expandedPaths.has(path);
}

function walkValue(
  value: JsonValue,
  path: string,
  keyLabel: string,
  depth: number,
  expandedPaths: Set<string>,
  lines: TreeLine[],
): void {
  const valueType = getValueType(value);
  const isExpandable = valueType === "object" || valueType === "array";
  const linePath = path || "$";

  lines.push({
    id: linePath,
    path: linePath,
    depth,
    keyLabel,
    valuePreview: previewValue(value, valueType),
    valueType,
    isExpandable,
  });

  if (!isExpandable || !isPathExpanded(linePath, expandedPaths)) {
    return;
  }

  if (valueType === "object") {
    for (const [key, child] of Object.entries(
      value as Record<string, JsonValue>,
    )) {
      const childPath = path ? `${path}.${key}` : key;
      walkValue(child, childPath, key, depth + 1, expandedPaths, lines);
    }
    return;
  }

  (value as JsonValue[]).forEach((child, index) => {
    const childPath = `${path}[${index}]`;
    walkValue(child, childPath, `[${index}]`, depth + 1, expandedPaths, lines);
  });
}

export function buildTreeLines(
  data: Record<string, unknown>,
  expandedPaths: Set<string>,
): TreeLine[] {
  const lines: TreeLine[] = [];
  walkValue(data as JsonValue, "", "root", 0, expandedPaths, lines);
  return lines;
}

export function defaultExpandedPaths(
  data: Record<string, unknown>,
): Set<string> {
  const paths = new Set<string>(["$"]);
  const rootKeys = Object.keys(data).slice(0, 8);

  for (const key of rootKeys) {
    paths.add(key);
  }

  return paths;
}
