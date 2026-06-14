import type { UserChatMessage } from "@/types/chat";

interface UserMessageProps {
  message: UserChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <article className="flex justify-end">
      <p className="max-w-[85%] rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-zinc-100">
        {message.text}
      </p>
    </article>
  );
}
