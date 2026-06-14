import { describe, expect, it } from "vitest";
import {
  createSeqBuffer,
  ingestServerMessage,
} from "@/lib/protocol/seq-buffer";
import { applyServerEvent } from "@/lib/session/apply-server-event";
import type { ChatMessage } from "@/types/chat";
import type { ServerMessage } from "@/types/protocol";

function processReady(
  messages: ChatMessage[],
  buffer: ReturnType<typeof createSeqBuffer>,
  ready: ServerMessage[],
): { messages: ChatMessage[]; buffer: ReturnType<typeof createSeqBuffer> } {
  let nextMessages = messages;
  let nextBuffer = buffer;

  for (const message of ready) {
    nextMessages = applyServerEvent(nextMessages, message).messages;
    nextBuffer = { ...nextBuffer, lastProcessedSeq: message.seq };
  }

  return { messages: nextMessages, buffer: nextBuffer };
}

describe("session seq ordering with interleaved PING", () => {
  it("processes TOOL_RESULT after TOOL_CALL when PING occupies the next seq", () => {
    let buffer = createSeqBuffer(0);
    let messages: ChatMessage[] = [];

    const toolCall = ingestServerMessage(buffer, {
      type: "TOOL_CALL",
      seq: 1,
      call_id: "tc1",
      tool_name: "lookup_metric",
      args: { metric: "revenue" },
      stream_id: "s1",
    });
    buffer = toolCall.state;
    ({ messages, buffer } = processReady(messages, buffer, toolCall.ready));

    const ping = ingestServerMessage(buffer, {
      type: "PING",
      seq: 2,
      challenge: "abc",
    });
    buffer = ping.state;
    ({ messages, buffer } = processReady(messages, buffer, ping.ready));

    const toolResult = ingestServerMessage(buffer, {
      type: "TOOL_RESULT",
      seq: 3,
      call_id: "tc1",
      result: { value: "23%" },
      stream_id: "s1",
    });
    buffer = toolResult.state;
    ({ messages } = processReady(messages, buffer, toolResult.ready));

    const assistant = messages[0];
    expect(assistant?.role).toBe("assistant");
    if (assistant?.role === "assistant") {
      const tool = assistant.segments.find(
        (segment) => segment.kind === "tool",
      );
      expect(tool?.kind).toBe("tool");
      if (tool?.kind === "tool") {
        expect(tool.status).toBe("complete");
      }
    }
  });
});
