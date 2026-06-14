export type MobilePanel = "chat" | "trace" | "context";

interface MobilePanelTabsProps {
  activePanel: MobilePanel;
  onChange: (panel: MobilePanel) => void;
}

const TABS: { id: MobilePanel; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "trace", label: "Trace" },
  { id: "context", label: "Context" },
];

export function MobilePanelTabs({
  activePanel,
  onChange,
}: MobilePanelTabsProps) {
  return (
    <nav
      className="flex shrink-0 border-b border-zinc-700 bg-zinc-900 lg:hidden"
      aria-label="Panel navigation"
    >
      {TABS.map((tab) => {
        const isActive = activePanel === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`min-h-11 flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-sky-500 text-sky-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
