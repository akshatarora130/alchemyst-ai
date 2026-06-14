import { describe, expect, it } from "vitest";
import { appendTraceEntry } from "@/lib/trace/append-trace-entry";

describe("appendTraceEntry", () => {
  it("groups consecutive tokens for the same stream", () => {
    let entries = appendTraceEntry([], {
      type: "TOKEN",
      seq: 1,
      stream_id: "s1",
      text: "Hello ",
    }, 1);

    entries = appendTraceEntry(entries, {
      type: "TOKEN",
      seq: 2,
      stream_id: "s1",
      text: "world",
    }, 1);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe("token_group");
    if (entries[0]?.kind === "token_group") {
      expect(entries[0].tokenCount).toBe(2);
      expect(entries[0].text).toBe("Hello world");
    }
  });

  it("starts a new token group after a tool call", () => {
    let entries = appendTraceEntry([], {
      type: "TOKEN",
      seq: 1,
      stream_id: "s1",
      text: "A",
    }, 1);

    entries = appendTraceEntry(entries, {
      type: "TOOL_CALL",
      seq: 2,
      stream_id: "s1",
      call_id: "tc1",
      tool_name: "lookup",
      args: {},
    }, 1);

    entries = appendTraceEntry(entries, {
      type: "TOKEN",
      seq: 3,
      stream_id: "s1",
      text: "B",
    }, 1);

    expect(entries).toHaveLength(3);
    expect(entries[0]?.kind).toBe("token_group");
    expect(entries[1]?.kind).toBe("tool_call");
    expect(entries[2]?.kind).toBe("token_group");
  });
});
