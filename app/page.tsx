import { ConnectionProvider } from "@/providers/connection-provider";
import { ConsoleShell } from "@/components/layout/console-shell";

export default function Home() {
  return (
    <ConnectionProvider>
      <ConsoleShell />
    </ConnectionProvider>
  );
}
