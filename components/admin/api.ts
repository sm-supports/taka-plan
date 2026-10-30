"use client";
// Fetch helpers for /api/admin/*: same-origin, cookie-based, CSRF header on every mutation.
import type { RatesSnapshot } from "@taka/engine";
import type { AdminRatesResponse, EditRowRequest, PreviewResponse } from "./types";

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

const CSRF_HEADERS = { "content-type": "application/json", "x-requested-with": "taka-admin" } as const;

async function fail(res: Response): Promise<never> {
  let code = "HTTP_" + res.status;
  let message = res.statusText || `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string } };
    if (body?.error?.code) code = body.error.code;
    if (body?.error?.message) message = body.error.message;
  } catch {
    // not JSON
  }
  throw new AdminApiError(res.status, code, message);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "same-origin", cache: "no-store" });
  if (!res.ok) return fail(res);
  return (await res.json()) as T;
}

async function send<T>(method: "POST" | "PUT", path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method, credentials: "same-origin", headers: CSRF_HEADERS, body: JSON.stringify(body ?? {}) });
  if (!res.ok) return fail(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const adminApi = {
  login: (password: string) => send<void>("POST", "/api/admin/login", { password }),
  logout: () => send<void>("POST", "/api/admin/logout", {}),
  rates: (before?: number) => getJson<AdminRatesResponse>(before === undefined ? "/api/admin/rates" : `/api/admin/rates?before=${before}`),
  editRow: (body: EditRowRequest) => send<RatesSnapshot>("PUT", "/api/admin/rates", body),
  publish: (note: string) => send<{ version: number }>("POST", "/api/admin/publish", { note }),
  discard: () => send<void>("POST", "/api/admin/discard", {}),
  preview: () => getJson<PreviewResponse>("/api/admin/preview"),
};

/** sessionStorage flag: the preview was opened for this draft version in this browser session. */
const PREVIEW_FLAG = "tp_admin_preview_seen";

export function markPreviewSeen(draftVersion: number): void {
  try {
    sessionStorage.setItem(PREVIEW_FLAG, String(draftVersion));
  } catch {
    // storage unavailable: publishing stays disabled, which is the safe side
  }
}

export function wasPreviewSeen(draftVersion: number): boolean {
  try {
    return sessionStorage.getItem(PREVIEW_FLAG) === String(draftVersion);
  } catch {
    return false;
  }
}

export function clearPreviewSeen(): void {
  try {
    sessionStorage.removeItem(PREVIEW_FLAG);
  } catch {
    // ignore
  }
}

export function errorMessage(e: unknown): string {
  if (e instanceof AdminApiError) return `${e.message} (${e.code})`;
  if (e instanceof Error) return e.message;
  return String(e);
}
