import type { ServerMessage } from "@/types/protocol";
import type { TraceEntry } from "@/types/trace";

function appendTokenGroup(
  entries: TraceEntry[],
  message: Extract<ServerMessage, { type: "TOKEN" }>,
  now: number,
): TraceEntry[] {
  const last = entries[entries.length - 1];

  if (last?.kind === "token_group" && last.streamId === message.stream_id) {
    const updated = entries.slice(0, -1);

    updated.push({
      ...last,
      tokenCount: last.tokenCount + 1,
      text: last.text + message.text,
      endSeq: message.seq,
      durationMs: Math.max(now - last.startedAt, 0),
    });

    return updated;
  }

  return [
    ...entries,
    {
      kind: "token_group",
      id: `trace-token-${message.seq}`,
      seq: message.seq,
      endSeq: message.seq,
      streamId: message.stream_id,
      tokenCount: 1,
      text: message.text,
      startedAt: now,
      durationMs: 0,
    },
  ];
}

export function appendTraceEntry(
  entries: TraceEntry[],
  message: ServerMessage,
  now = Date.now(),
): TraceEntry[] {
  switch (message.type) {
    case "TOKEN":
      return appendTokenGroup(entries, message, now);
    case "TOOL_CALL":
      return [
        ...entries,
        {
          kind: "tool_call",
          id: `trace-call-${message.call_id}`,
          seq: message.seq,
          callId: message.call_id,
          toolName: message.tool_name,
          streamId: message.stream_id,
        },
      ];
    case "TOOL_RESULT":
      return [
        ...entries,
        {
          kind: "tool_result",
          id: `trace-result-${message.call_id}`,
          seq: message.seq,
          callId: message.call_id,
          streamId: message.stream_id,
        },
      ];
    case "CONTEXT_SNAPSHOT":
      return [
        ...entries,
        {
          kind: "context_snapshot",
          id: `trace-context-${message.seq}`,
          seq: message.seq,
          contextId: message.context_id,
        },
      ];
    case "PING":
      return [
        ...entries,
        {
          kind: "ping",
          id: `trace-ping-${message.seq}`,
          seq: message.seq,
          challenge: message.challenge,
        },
      ];
    case "ERROR":
      return [
        ...entries,
        {
          kind: "error",
          id: `trace-error-${message.seq}`,
          seq: message.seq,
          code: message.code,
          message: message.message,
        },
      ];
    case "STREAM_END":
      return [
        ...entries,
        {
          kind: "stream_end",
          id: `trace-end-${message.seq}`,
          seq: message.seq,
          streamId: message.stream_id,
        },
      ];
    default:
      return entries;
  }
}

export function appendPongTraceEntry(
  entries: TraceEntry[],
  echo: string,
  now = Date.now(),
): TraceEntry[] {
  return [
    ...entries,
    {
      kind: "pong",
      id: `trace-pong-${now}-${echo}`,
      echo,
      sentAt: now,
    },
  ];
}
