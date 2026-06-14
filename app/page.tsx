import { AgentProvider } from "@/providers/agent-provider";
import { ConsoleShell } from "@/components/layout/console-shell";

export default function Home() {
  return (
    <AgentProvider>
      <ConsoleShell />
    </AgentProvider>
  );
}
