import type { AssistantChatMessage, ChatMessage } from "@/types/chat";
import type { ServerMessage } from "@/types/protocol";

export interface ApplyResult {
  messages: ChatMessage[];
  toolAckCallId: string | null;
}

function findAssistantByStreamId(
  messages: ChatMessage[],
  streamId: string,
): AssistantChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "assistant" && message.streamId === streamId) {
      return message;
    }
  }

  return null;
}

function replaceAssistant(
  messages: ChatMessage[],
  updated: AssistantChatMessage,
): ChatMessage[] {
  return messages.map((message) =>
    message.id === updated.id ? updated : message,
  );
}

function appendToken(
  assistant: AssistantChatMessage,
  token: string,
): AssistantChatMessage {
  const segments = [...assistant.segments];
  const lastSegment = segments[segments.length - 1];

  if (lastSegment?.kind === "text") {
    segments[segments.length - 1] = {
      ...lastSegment,
      text: lastSegment.text + token,
    };
  } else {
    segments.push({
      kind: "text",
      id: crypto.randomUUID(),
      text: token,
    });
  }

  return { ...assistant, segments };
}

function applyToken(
  messages: ChatMessage[],
  streamId: string,
  token: string,
): ChatMessage[] {
  const existing = findAssistantByStreamId(messages, streamId);

  if (existing) {
    return replaceAssistant(messages, appendToken(existing, token));
  }

  const assistant: AssistantChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    streamId,
    segments: [{ kind: "text", id: crypto.randomUUID(), text: token }],
    isComplete: false,
  };

  return [...messages, assistant];
}

function applyToolCall(
  messages: ChatMessage[],
  message: Extract<ServerMessage, { type: "TOOL_CALL" }>,
): ApplyResult {
  let assistant = findAssistantByStreamId(messages, message.stream_id);

  if (!assistant) {
    assistant = {
      id: crypto.randomUUID(),
      role: "assistant",
      streamId: message.stream_id,
      segments: [],
      isComplete: false,
    };
    messages = [...messages, assistant];
  }

  const updated: AssistantChatMessage = {
    ...assistant,
    segments: [
      ...assistant.segments,
      {
        kind: "tool",
        id: crypto.randomUUID(),
        callId: message.call_id,
        toolName: message.tool_name,
        args: message.args,
        status: "pending",
      },
    ],
  };

  return {
    messages: replaceAssistant(messages, updated),
    toolAckCallId: message.call_id,
  };
}

function applyToolResult(
  messages: ChatMessage[],
  message: Extract<ServerMessage, { type: "TOOL_RESULT" }>,
): ApplyResult {
  const assistant = findAssistantByStreamId(messages, message.stream_id);

  if (!assistant) {
    return { messages, toolAckCallId: null };
  }

  const segments = assistant.segments.map((segment) => {
    if (segment.kind === "tool" && segment.callId === message.call_id) {
      return {
        ...segment,
        status: "complete" as const,
        result: message.result,
      };
    }

    return segment;
  });

  return {
    messages: replaceAssistant(messages, { ...assistant, segments }),
    toolAckCallId: null,
  };
}

function applyStreamEnd(
  messages: ChatMessage[],
  streamId: string,
): ChatMessage[] {
  const assistant = findAssistantByStreamId(messages, streamId);

  if (!assistant) {
    return messages;
  }

  return replaceAssistant(messages, { ...assistant, isComplete: true });
}

function applyError(messages: ChatMessage[], errorText: string): ChatMessage[] {
  const last = messages[messages.length - 1];

  if (last?.role === "assistant" && !last.isComplete) {
    return replaceAssistant(
      messages,
      appendToken(last, `\n[Error: ${errorText}]`),
    );
  }

  return [
    ...messages,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      streamId: "error",
      segments: [
        {
          kind: "text",
          id: crypto.randomUUID(),
          text: `[Error: ${errorText}]`,
        },
      ],
      isComplete: true,
    },
  ];
}

export function applyServerEvent(
  messages: ChatMessage[],
  message: ServerMessage,
): ApplyResult {
  switch (message.type) {
    case "TOKEN":
      return {
        messages: applyToken(messages, message.stream_id, message.text),
        toolAckCallId: null,
      };
    case "TOOL_CALL":
      return applyToolCall(messages, message);
    case "TOOL_RESULT":
      return applyToolResult(messages, message);
    case "STREAM_END":
      return {
        messages: applyStreamEnd(messages, message.stream_id),
        toolAckCallId: null,
      };
    case "ERROR":
      return {
        messages: applyError(messages, message.message),
        toolAckCallId: null,
      };
    case "CONTEXT_SNAPSHOT":
    case "PING":
      return { messages, toolAckCallId: null };
    default:
      return { messages, toolAckCallId: null };
  }
}
