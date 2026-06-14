import { describe, expect, it } from "vitest";
import { computeJsonDiff } from "@/lib/context/compute-json-diff";

describe("computeJsonDiff", () => {
  it("detects added, removed, and changed keys", () => {
    const previous = {
      report: "Q3-2025",
      pages: 47,
      stale: true,
    };

    const current = {
      report: "Q3-2025",
      pages: 48,
      sections: ["revenue"],
    };

    const changes = computeJsonDiff(previous, current);

    expect(changes.some((change) => change.kind === "add")).toBe(true);
    expect(changes.some((change) => change.kind === "remove")).toBe(true);
    expect(changes.some((change) => change.kind === "change")).toBe(true);
  });

  it("formats array paths to match tree paths", () => {
    const previous = { items: [{ name: "a" }] };
    const current = { items: [{ name: "b" }] };

    const changes = computeJsonDiff(previous, current);

    expect(changes[0]?.path).toBe("items[0].name");
  });
});
