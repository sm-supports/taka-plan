// Small helpers for App Router route handlers: JSON responses and error mapping.
import { isEngineError } from "@taka/engine";

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

/** JSON response with content-type set; `init.headers` may add more. */
export function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

/** `{ error: { code, message } }` with the given status. */
export function httpError(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, { status });
}

/** Parses the request body as JSON; throws HttpError 400 when it is not valid JSON. */
export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
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
