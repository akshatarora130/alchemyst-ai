"use client";

import { useEffect, useRef } from "react";
import { Panel } from "@/components/ui/panel";
import { useAgent } from "@/providers/agent-provider";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";

export function ChatPanel() {
  const { messages, sendUserMessage, status } = useAgent();
  const canSend = status === "connected";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <Panel
      title="Chat"
      description="Streamed responses and tool call interruptions"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden p-0"
    >
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
      >
        <MessageList messages={messages} />
      </div>
      <ChatInput onSend={sendUserMessage} disabled={!canSend} />
    </Panel>
  );
}
