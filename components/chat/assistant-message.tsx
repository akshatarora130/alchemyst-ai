import type { AssistantChatMessage } from "@/types/chat";
import { ToolCallCard } from "@/components/chat/tool-call-card";

interface AssistantMessageProps {
  message: AssistantChatMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <article className="flex justify-start">
      <div className="max-w-[92%] space-y-2">
        {message.segments.map((segment) => {
          if (segment.kind === "text") {
            if (segment.text.length === 0) {
              return null;
            }

            return (
              <p
                key={segment.id}
                className="whitespace-pre-wrap rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm leading-relaxed text-zinc-100"
              >
                {segment.text}
              </p>
            );
          }

          return <ToolCallCard key={segment.id} segment={segment} />;
        })}

        {!message.isComplete ? (
          <span className="inline-block h-4 w-1 animate-pulse bg-sky-400" />
        ) : null}
      </div>
    </article>
  );
}
