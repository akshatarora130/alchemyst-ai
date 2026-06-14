import type { AssistantChatMessage } from "@/types/chat";
import { ToolCallCard } from "@/components/chat/tool-call-card";

interface AssistantMessageProps {
  message: AssistantChatMessage;
  highlightedCallId: string | null;
  onToolSelect: (callId: string) => void;
  isConnected: boolean;
}

export function AssistantMessage({
  message,
  highlightedCallId,
  onToolSelect,
  isConnected,
}: AssistantMessageProps) {
  return (
    <article className="flex justify-start">
      <div className="max-w-[92%] space-y-3">
        {message.segments.map((segment) => {
          if (segment.kind === "text") {
            if (segment.text.length === 0) {
              return null;
            }

            return (
              <p
                key={segment.id}
                data-stream-id={message.streamId}
                className="whitespace-pre-wrap rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-100"
              >
                {segment.text}
              </p>
            );
          }

          return (
            <ToolCallCard
              key={segment.id}
              segment={segment}
              highlighted={highlightedCallId === segment.callId}
              onSelect={() => onToolSelect(segment.callId)}
              isConnected={isConnected}
            />
          );
        })}

        {!message.isComplete ? (
          <span className="inline-block h-4 w-1 animate-pulse bg-sky-400" />
        ) : null}
      </div>
    </article>
  );
}
