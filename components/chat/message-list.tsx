import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { UserMessage } from "@/components/chat/user-message";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-40 items-center justify-center px-4 text-center">
        <p className="text-sm text-zinc-500">
          Send a message to start. Try &quot;Summarise the Q3 report&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
