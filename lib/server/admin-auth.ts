// Admin session: password check and a signed, expiring cookie. Server-only (reads the secret via env.ts).
import { getAdminPassword, getSessionSecret } from "./env";

export const ADMIN_COOKIE = "tp_admin";
/** Session lifetime: 12 hours. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const CSRF_HEADER = "x-requested-with";
export const CSRF_VALUE = "taka-admin";

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", encoder.encode(text));
}

/** Constant-time byte comparison; never short-circuits on the first mismatch. */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/** The value shipped in .dev.vars.example; only ever acceptable on a local dev host. */
export const PLACEHOLDER_PASSWORD = "change-me";
const LOCAL_HOSTS: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
let warnedPlaceholder = false;

/** True when the request URL's host is a local development host (localhost / loopback). */
export function isLocalHost(requestUrl: string | undefined): boolean {
  if (!requestUrl) return false;
  try {
    const host = new URL(requestUrl).hostname.toLowerCase();
    return LOCAL_HOSTS.has(host) || host.endsWith(".localhost");
  } catch {
    return false;
  }
}

/** Shortest ADMIN_PASSWORD accepted off a local host; a shorter one leaves the admin locked. */
export const MIN_PASSWORD_LENGTH = 12;
/** Shortest SESSION_SECRET used; a shorter one is ignored (the password-derived key is used). */
export const MIN_SESSION_SECRET_LENGTH = 32;

/** Why admin sign-in is off: no password, the .dev.vars.example placeholder, or under 12 characters. */
export type AdminConfigProblem = "not-set" | "placeholder" | "too-short";

export const ADMIN_PROBLEM_MESSAGES: Readonly<Record<AdminConfigProblem, string>> = {
  "not-set": "Admin sign-in is off: the ADMIN_PASSWORD secret is not set.",
  placeholder: "Admin sign-in is off: ADMIN_PASSWORD is still the placeholder from .dev.vars.example.",
  "too-short": `Admin sign-in is off: ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
};

let warnedShort = false;

/**
 * Why the admin is locked for a request to `requestUrl`, or null when ADMIN_PASSWORD is usable.
 * The placeholder (SEC-10) and passwords under MIN_PASSWORD_LENGTH count as not configured except
 * on a local development host; a missing URL counts as not local.
 */
export function adminConfigProblem(requestUrl?: string): AdminConfigProblem | null {
  const p = getAdminPassword();
  if (p === undefined) return "not-set";
  if (isLocalHost(requestUrl)) return null;
  if (p === PLACEHOLDER_PASSWORD) {
    if (!warnedPlaceholder) {
      warnedPlaceholder = true;
      console.warn("[admin] ADMIN_PASSWORD is still the placeholder; admin sign-in is disabled outside localhost");
    }
    return "placeholder";
  }
  if (p.length < MIN_PASSWORD_LENGTH) {
    if (!warnedShort) {
      warnedShort = true;
      console.warn(`[admin] ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters; admin sign-in is disabled outside localhost`);
    }
    return "too-short";
  }
  return null;
}

/**
 * True when `input` matches ADMIN_PASSWORD. Both sides are hashed first; an unset password never
 * matches, and neither the placeholder from .dev.vars.example nor a password shorter than 12
 * characters matches off a local host (SEC-10), so a forgotten or weak secret cannot open the admin
 * in production.
 */
export async function verifyPassword(input: string, requestUrl?: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (expected === undefined || typeof input !== "string") return false;
  if (adminConfigProblem(requestUrl) !== null) return false;
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  return constantTimeEqual(new Uint8Array(a), new Uint8Array(b));
}

let warnedSecret = false;

/**
 * Key material for the session HMAC: SESSION_SECRET when it is set and long enough (so a stolen
 * cookie says nothing about the password, and rotating the secret signs everyone out), else derived
 * from ADMIN_PASSWORD. Null when no admin password is configured (the admin stays locked).
 */
function keyMaterial(): string | null {
  const password = getAdminPassword();
  if (password === undefined) return null;
  const secret = getSessionSecret();
  if (secret !== undefined) {
    if (secret.length >= MIN_SESSION_SECRET_LENGTH) return `taka-admin-session:${secret}`;
    if (!warnedSecret) {
      warnedSecret = true;
      console.warn(`[admin] SESSION_SECRET is shorter than ${MIN_SESSION_SECRET_LENGTH} characters and is ignored`);
    }
  }
  return `taka-admin:${password}`;
}

async function sign(material: string, message: string): Promise<string> {
  const raw = await sha256(material);
  const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/** Session token `"<expiryMs>.<hmacHex>"`, valid for 12 hours. Throws when no admin password is configured. */
export async function createSessionCookie(now: number = Date.now()): Promise<string> {
  const material = keyMaterial();
  if (material === null) throw new Error("ADMIN_PASSWORD is not set");
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${await sign(material, exp)}`;
}

/** Validates a token produced by createSessionCookie: well-formed, unexpired, signature matches. */
export async function verifySessionToken(token: string | undefined | null, now: number = Date.now()): Promise<boolean> {
  if (!token) return false;
  const material = keyMaterial();
  if (material === null) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!/^\d{1,16}$/.test(exp) || !/^[0-9a-f]{64}$/.test(mac)) return false;
  if (Number(exp) <= now) return false;
  const expected = await sign(material, exp);
  return constantTimeEqual(encoder.encode(mac), encoder.encode(expected));
}

/** Anything that can hand back a cookie by name (Next's cookies() store). */
export interface CookieGetter {
  get(name: string): { value: string } | undefined;
}

/** Reads `tp_admin` from a raw Cookie header. A malformed percent-encoding counts as no cookie (never a 500). */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/**
 * True when the Cookie header / cookie store carries a valid admin session and the admin is
 * configured for a request to `requestUrl` (adminConfigProblem; a missing URL counts as not local),
 * so lowering ADMIN_PASSWORD under 12 characters also ends sessions already open.
 */
export async function isAdmin(source: string | CookieGetter | null | undefined, now: number = Date.now(), requestUrl?: string): Promise<boolean> {
  try {
    if (adminConfigProblem(requestUrl) !== null) return false;
    const token = typeof source === "string" || source === null || source === undefined ? readCookie(source, ADMIN_COOKIE) : source.get(ADMIN_COOKIE)?.value;
    return await verifySessionToken(token, now);
  } catch {
    return false;
  }
}

function cookieAttributes(secure: boolean): string {
  return `HttpOnly; SameSite=Strict; Path=/${secure ? "; Secure" : ""}`;
}

/** Secure only when the request is served over https. */
export function isSecureRequest(req: Request): boolean {
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Set-Cookie header value for a session token. */
export function sessionCookieHeader(token: string, secure: boolean): string {
  return `${ADMIN_COOKIE}=${token}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; ${cookieAttributes(secure)}`;
}

/** Set-Cookie header value that removes the session. */
export function clearSessionCookie(secure: boolean): string {
  return `${ADMIN_COOKIE}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieAttributes(secure)}`;
}
