"use client";

import { Panel } from "@/components/ui/panel";
import { useAgent } from "@/providers/agent-provider";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";

export function ChatPanel() {
  const { messages, sendUserMessage, status } = useAgent();
  const canSend = status === "connected";

  return (
    <Panel
      title="Chat"
      description="Streamed responses and tool call interruptions"
      className="h-full"
    >
      <div className="-m-4 flex min-h-80 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageList messages={messages} />
        </div>
        <ChatInput onSend={sendUserMessage} disabled={!canSend} />
      </div>
    </Panel>
  );
}
