import { describe, expect, it } from "vitest";
import { applyServerEvent } from "@/lib/session/apply-server-event";
import type { ChatMessage } from "@/types/chat";

describe("applyServerEvent", () => {
  it("streams tokens into one text segment", () => {
    let messages: ChatMessage[] = [];

    messages = applyServerEvent(messages, {
      type: "TOKEN",
      seq: 1,
      stream_id: "s1",
      text: "Hello ",
    }).messages;

    messages = applyServerEvent(messages, {
      type: "TOKEN",
      seq: 2,
      stream_id: "s1",
      text: "world",
    }).messages;

    const assistant = messages[0];
    expect(assistant?.role).toBe("assistant");
    if (assistant?.role === "assistant") {
      expect(assistant.segments).toHaveLength(1);
      expect(assistant.segments[0]?.kind).toBe("text");
      if (assistant.segments[0]?.kind === "text") {
        expect(assistant.segments[0].text).toBe("Hello world");
      }
    }
  });

  it("pauses stream for tool call and resumes after result", () => {
    let messages: ChatMessage[] = [];

    messages = applyServerEvent(messages, {
      type: "TOKEN",
      seq: 1,
      stream_id: "s1",
      text: "Revenue ",
    }).messages;

    const toolCall = applyServerEvent(messages, {
      type: "TOOL_CALL",
      seq: 2,
      stream_id: "s1",
      call_id: "tc1",
      tool_name: "lookup_metric",
      args: { metric: "revenue" },
    });

    expect(toolCall.toolAckCallId).toBe("tc1");
    messages = toolCall.messages;

    messages = applyServerEvent(messages, {
      type: "TOOL_RESULT",
      seq: 3,
      stream_id: "s1",
      call_id: "tc1",
      result: { value: "23%" },
    }).messages;

    messages = applyServerEvent(messages, {
      type: "TOKEN",
      seq: 4,
      stream_id: "s1",
      text: "23% growth",
    }).messages;

    const assistant = messages[0];
    if (assistant?.role === "assistant") {
      expect(assistant.segments).toHaveLength(3);
      expect(assistant.segments[0]?.kind).toBe("text");
      expect(assistant.segments[1]?.kind).toBe("tool");
      expect(assistant.segments[2]?.kind).toBe("text");
      if (assistant.segments[2]?.kind === "text") {
        expect(assistant.segments[2].text).toBe("23% growth");
      }
    }
  });
});
