"use client";
/** Admin chrome: English dictionary provider, top bar with the three sections and sign-out. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { I18nProvider } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/types";
import { useT } from "@/lib/i18n/useT";
import { adminApi, clearPreviewSeen } from "./api";
import { useAdminSession } from "./AdminGate";

export interface AdminProvidersProps {
  dict: Dictionary;
  children: ReactNode;
}

/** The admin is English-only; keys still exist in bn so the dictionary shape stays complete. */
export function AdminProviders({ dict, children }: AdminProvidersProps) {
  return (
    <I18nProvider locale="en" dict={dict}>
      {children}
    </I18nProvider>
  );
}

const LINKS = [
  { href: "/admin", key: "admin.nav.rates" },
  { href: "/admin/preview", key: "admin.nav.preview" },
  { href: "/admin/log", key: "admin.nav.log" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const pathname = usePathname();
  const session = useAdminSession();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await adminApi.logout();
      clearPreviewSeen();
      await session.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-page text-text">
      <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link href="/admin" className="tap inline-flex items-center gap-2 rounded-xl text-lg font-bold text-brand-700">
              <svg className="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
                <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              {t("admin.title")}
            </Link>
            <Button variant="ghost" onClick={signOut} loading={signingOut} className="-mr-2">
              {t("admin.login.signOut")}
            </Button>
          </div>
          <nav aria-label={t("admin.title")} className="-mx-1 flex gap-1 overflow-x-auto pb-2">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("tap inline-flex items-center rounded-xl px-4 text-base font-semibold", active ? "bg-brand-600 text-white" : "text-text-muted hover:bg-surface-muted")}
                >
                  {t(l.key)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</main>
    </div>
  );
}
