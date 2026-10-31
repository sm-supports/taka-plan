"use client";
/** Password-only sign-in. On success the server layout re-renders with the cookie set. */
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { AdminApiError, adminApi, errorMessage } from "./api";
import { useAdminSession } from "./AdminGate";

export function LoginForm() {
  const { t } = useT();
  const session = useAdminSession();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.login(password);
      setPassword("");
      await session.refresh();
    } catch (err) {
      setError(err instanceof AdminApiError && err.status === 401 ? t("admin.login.failed") : t("admin.state.error", { message: errorMessage(err) }));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm">
        <h1 className="text-2xl font-bold">{t("admin.login.title")}</h1>
        <label htmlFor="admin-password" className="flex flex-col gap-1.5 text-base font-semibold">
          {t("admin.login.password")}
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="tap w-full rounded-xl border border-line bg-surface px-4 py-3 text-lg font-normal focus:border-brand-500"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-status-red">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={busy} disabled={password.length === 0}>
          {t("admin.login.submit")}
        </Button>
        <p className="text-sm text-text-muted">{t("admin.login.hint")}</p>
      </form>
    </main>
  );
}
