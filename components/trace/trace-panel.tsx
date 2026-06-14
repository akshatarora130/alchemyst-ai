import { Panel } from "@/components/ui/panel";

export function TracePanel() {
  return (
    <Panel
      title="Agent Trace"
      description="Protocol events in real time"
      className="h-full"
    >
      <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-800/50 px-4 text-center">
        <p className="text-sm text-zinc-300">Trace timeline</p>
      </div>
    </Panel>
  );
}
