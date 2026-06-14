import { Panel } from "@/components/ui/panel";

export function ChatPanel() {
  return (
    <Panel
      title="Chat"
      description="Streamed responses and tool call interruptions"
      className="h-full"
    >
      <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-800/50 px-4 text-center">
        <p className="text-sm text-zinc-300">Chat panel</p>
      </div>
    </Panel>
  );
}
