"use client";

import { useState } from "react";
import { useConnection } from "@/providers/agent-provider";
import { AppHeader } from "@/components/layout/app-header";
import {
  MobilePanelTabs,
  type MobilePanel,
} from "@/components/layout/mobile-panel-tabs";
import { ChatPanel } from "@/components/chat/chat-panel";
import { TracePanel } from "@/components/trace/trace-panel";
import { ContextPanel } from "@/components/context/context-panel";

function panelVisibility(activePanel: MobilePanel, panel: MobilePanel): string {
  return activePanel === panel
    ? "flex min-h-0 flex-1 flex-col"
    : "hidden min-h-0 flex-1 flex-col lg:flex";
}

export function ConsoleShell() {
  const [activePanel, setActivePanel] = useState<MobilePanel>("chat");
  const { status } = useConnection();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-zinc-950">
      <AppHeader connectionStatus={status} />
      <MobilePanelTabs activePanel={activePanel} onChange={setActivePanel} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:p-6">
        <div
          className={
            panelVisibility(activePanel, "trace") + " lg:w-80 lg:shrink-0"
          }
        >
          <TracePanel />
        </div>
        <div
          className={
            panelVisibility(activePanel, "chat") + " lg:min-w-0 lg:flex-2"
          }
        >
          <ChatPanel />
        </div>
        <div
          className={
            panelVisibility(activePanel, "context") + " lg:w-80 lg:shrink-0"
          }
        >
          <ContextPanel />
        </div>
      </div>
    </div>
  );
}
