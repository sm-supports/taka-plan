"use client";
/** Grey pill shown only while the browser reports no connection (navigator.onLine + online/offline events). */
import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui/cn";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getSnapshot = () => navigator.onLine;
/** On the server (and for the hydration pass) assume online so the badge never flashes. */
const getServerSnapshot = () => true;

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function OfflineBadge({ className }: { className?: string }) {
  const { t } = useT();
  const online = useOnline();
  if (online) return null;
  return (
    <span role="status" className={cn("inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-muted", className)}>
      <span className="h-2 w-2 rounded-full bg-text-faint" aria-hidden="true" />
      {t("common.offline")}
    </span>
  );
}
