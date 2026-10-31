"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AdminShell } from "./AdminShell";
import { LoginForm } from "./LoginForm";

type State = "checking" | "in" | "out";
const SessionCtx = createContext<{ refresh: () => Promise<void> }>({ refresh: async () => {} });
export const useAdminSession = () => useContext(SessionCtx);

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" });
      const body = res.ok ? ((await res.json()) as { admin?: boolean }) : null;
      setState(body?.admin ? "in" : "out");
    } catch {
      setState("out");
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <SessionCtx.Provider value={{ refresh }}>
      {state === "checking" ? <Skeleton page /> : state === "in" ? <AdminShell>{children}</AdminShell> : <LoginForm />}
    </SessionCtx.Provider>
  );
}
