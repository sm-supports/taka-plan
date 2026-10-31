// Small helpers for App Router route handlers: JSON responses and error mapping.
import { isEngineError } from "@taka/engine";
import { applySecurityHeaders } from "./security-headers";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

/** JSON response with content-type and the security headers set; `init.headers` may add more. */
export function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  applySecurityHeaders(headers);
  return new Response(JSON.stringify(data), { ...init, headers });
}

/** `{ error: { code, message } }` with the given status. */
export function httpError(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, { status });
}

/** Largest JSON body a handler accepts (64 KB): rate patches and notes are tiny. */
export const MAX_JSON_BYTES = 64 * 1024;

/**
 * Parses the request body as JSON; throws HttpError 413 when the body is over MAX_JSON_BYTES
 * (checked on Content-Length first, then on the bytes actually read) and 400 when it is not valid JSON.
 */
export async function readJson<T>(req: Request): Promise<T> {
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) throw new HttpError(413, "TOO_LARGE", `Request body must be at most ${MAX_JSON_BYTES} bytes`);
  let text: string;
  try {
    text = await req.text();
  } catch {
    throw new HttpError(400, "BAD_JSON", "Request body must be valid JSON");
  }
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BYTES) throw new HttpError(413, "TOO_LARGE", `Request body must be at most ${MAX_JSON_BYTES} bytes`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "BAD_JSON", "Request body must be valid JSON");
  }
}

/** Maps any thrown value to a response. Unknown errors become 500 without leaking their message. */
export function toResponse(e: unknown): Response {
  if (e instanceof HttpError) return httpError(e.status, e.code, e.message);
  if (isEngineError(e) && e.code === "INVALID_INPUT") return httpError(400, "INVALID_INPUT", e.message);
  return httpError(500, "INTERNAL", "Something went wrong");
}
