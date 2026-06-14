import type { ServerMessage } from "@/types/protocol";

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

interface ParsedMessage {
  type?: string;
  seq?: number;
  text?: string;
  stream_id?: string;
  call_id?: string;
  tool_name?: string;
  args?: JsonObject;
  result?: JsonObject;
  context_id?: string;
  data?: JsonObject;
  challenge?: string;
  code?: string;
  message?: string;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseServerMessage(raw: string): ServerMessage | null {
  let message: ParsedMessage;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    message = parsed as ParsedMessage;
  } catch {
    return null;
  }

  if (typeof message.type !== "string" || typeof message.seq !== "number") {
    return null;
  }

  const { type, seq } = message;

  switch (type) {
    case "TOKEN":
      if (
        typeof message.text !== "string" ||
        typeof message.stream_id !== "string"
      ) {
        return null;
      }
      return {
        type: "TOKEN",
        seq,
        text: message.text,
        stream_id: message.stream_id,
      };

    case "TOOL_CALL":
      if (
        !message.call_id ||
        !message.tool_name ||
        !isJsonObject(message.args) ||
        typeof message.stream_id !== "string"
      ) {
        return null;
      }
      return {
        type: "TOOL_CALL",
        seq,
        call_id: message.call_id,
        tool_name: message.tool_name,
        args: message.args,
        stream_id: message.stream_id,
      };

    case "TOOL_RESULT":
      if (
        !message.call_id ||
        !isJsonObject(message.result) ||
        typeof message.stream_id !== "string"
      ) {
        return null;
      }
      return {
        type: "TOOL_RESULT",
        seq,
        call_id: message.call_id,
        result: message.result,
        stream_id: message.stream_id,
      };

    case "CONTEXT_SNAPSHOT":
      if (!message.context_id || !isJsonObject(message.data)) {
        return null;
      }
      return {
        type: "CONTEXT_SNAPSHOT",
        seq,
        context_id: message.context_id,
        data: message.data,
      };

    case "PING":
      if (typeof message.challenge !== "string") {
        return null;
      }
      return { type: "PING", seq, challenge: message.challenge };

    case "STREAM_END":
      if (typeof message.stream_id !== "string") {
        return null;
      }
      return { type: "STREAM_END", seq, stream_id: message.stream_id };

    case "ERROR":
      if (!message.code || typeof message.message !== "string") {
        return null;
      }
      return {
        type: "ERROR",
        seq,
        code: message.code,
        message: message.message,
      };

    default:
      return null;
  }
}
