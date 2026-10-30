// Admin session: password check and a signed, expiring cookie. Server-only (reads the secret via env.ts).
import { getAdminPassword } from "./env";

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

/** True when `input` matches ADMIN_PASSWORD. Both sides are hashed first; an unset password never matches. */
export async function verifyPassword(input: string): Promise<boolean> {
  const expected = getAdminPassword();
  if (expected === undefined || typeof input !== "string") return false;
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  return constantTimeEqual(new Uint8Array(a), new Uint8Array(b));
}

async function hmacKey(password: string): Promise<CryptoKey> {
  const raw = await sha256(`taka-admin:${password}`);
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function sign(password: string, message: string): Promise<string> {
  const key = await hmacKey(password);
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/** Session token `"<expiryMs>.<hmacHex>"`, valid for 12 hours. Throws when no admin password is configured. */
export async function createSessionCookie(now: number = Date.now()): Promise<string> {
  const password = getAdminPassword();
  if (password === undefined) throw new Error("ADMIN_PASSWORD is not set");
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${await sign(password, exp)}`;
}

/** Validates a token produced by createSessionCookie: well-formed, unexpired, signature matches. */
export async function verifySessionToken(token: string | undefined | null, now: number = Date.now()): Promise<boolean> {
  if (!token) return false;
  const password = getAdminPassword();
  if (password === undefined) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!/^\d{1,16}$/.test(exp) || !/^[0-9a-f]{64}$/.test(mac)) return false;
  if (Number(exp) <= now) return false;
  const expected = await sign(password, exp);
  return constantTimeEqual(encoder.encode(mac), encoder.encode(expected));
}

/** Anything that can hand back a cookie by name (Next's cookies() store). */
export interface CookieGetter {
  get(name: string): { value: string } | undefined;
}

/** Reads `tp_admin` from a raw Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

/** True when the Cookie header / cookie store carries a valid admin session. */
export async function isAdmin(source: string | CookieGetter | null | undefined, now: number = Date.now()): Promise<boolean> {
  const token = typeof source === "string" || source === null || source === undefined ? readCookie(source, ADMIN_COOKIE) : source.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token, now);
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
