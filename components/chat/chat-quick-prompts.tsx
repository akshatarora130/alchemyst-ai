interface QuickPrompt {
  label: string;
  message: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Q3 report", message: "Summarise the Q3 report" },
  { label: "Analyze", message: "Analyze the agent" },
  { label: "Database schema", message: "Show me the full database schema" },
  { label: "Find docs", message: "Find the SLA docs" },
  { label: "Long doc", message: "Write a long detailed document" },
];

interface ChatQuickPromptsProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatQuickPrompts({
  onSend,
  disabled = false,
}: ChatQuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-zinc-700 bg-zinc-900 px-4 py-3 sm:px-5">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt.label}
          type="button"
          disabled={disabled}
          onClick={() => onSend(prompt.message)}
          className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
}
