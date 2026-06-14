"use client";

import { useEffect, useMemo, useRef } from "react";
import { Panel } from "@/components/ui/panel";
import { useAgent } from "@/providers/agent-provider";
import { findTraceIdByCallId } from "@/lib/trace/filter-trace-entries";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatQuickPrompts } from "@/components/chat/chat-quick-prompts";
import { ReconnectionBanner } from "@/components/chat/reconnection-banner";

export function ChatPanel() {
  const {
    messages,
    traceEntries,
    selectedTraceId,
    sendUserMessage,
    selectTrace,
    status,
    reconnectAttempt,
  } = useAgent();
  const canSend = status === "connected";
  const showRecoveryBanner = status === "reconnecting";
  const scrollRef = useRef<HTMLDivElement>(null);

  const highlightedCallId = useMemo(() => {
    const selected = traceEntries.find((entry) => entry.id === selectedTraceId);
    if (selected?.kind === "tool_call" || selected?.kind === "tool_result") {
      return selected.callId;
    }
    return null;
  }, [traceEntries, selectedTraceId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleToolSelect = (callId: string) => {
    const traceId = findTraceIdByCallId(traceEntries, callId, "tool_call");
    selectTrace(traceId);
  };

  return (
    <Panel
      title="Chat"
      description="Streamed responses and tool call interruptions"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      {showRecoveryBanner ? (
        <ReconnectionBanner reconnectAttempt={reconnectAttempt} />
      ) : null}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
      >
        <MessageList
          messages={messages}
          highlightedCallId={highlightedCallId}
          onToolSelect={handleToolSelect}
          isConnected={status === "connected"}
        />
      </div>
      <ChatQuickPrompts onSend={sendUserMessage} disabled={!canSend} />
      <ChatInput onSend={sendUserMessage} disabled={!canSend} />
    </Panel>
  );
}
