interface ReconnectionBannerProps {
  reconnectAttempt: number;
}

export function ReconnectionBanner({
  reconnectAttempt,
}: ReconnectionBannerProps) {
  const attemptLabel =
    reconnectAttempt > 0 ? ` (attempt ${reconnectAttempt + 1})` : "";

  return (
    <div
      role="status"
      aria-live="polite"
      className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 sm:px-5"
    >
      <p className="text-xs text-amber-300">
        Connection lost. Reconnecting{attemptLabel}… Missed events will resume
        automatically.
      </p>
    </div>
  );
}
