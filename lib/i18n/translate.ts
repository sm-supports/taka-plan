/**
 * Pure helpers shared by the client hook, server rendering and tests.
 * No React, no "use client": safe to import anywhere.
 */
import type { TranslateParams } from "./types";

/** Resolve a dot path ("m1.rule.noStocks") in a nested object. Returns undefined when any segment is missing. */
export function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const seg of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
    if (cur === undefined) return undefined;
  }
  return cur;
}

/** Substitute `{name}` slots. Unknown slots are left as-is so a missing param is visible in QA. */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const v = params[name];
    return v === undefined || v === null ? match : String(v);
  });
}

const warned = new Set<string>();

function warnMissing(key: string): void {
  if (process.env.NODE_ENV === "production" || warned.has(key)) return;
  warned.add(key);
  console.warn(`[i18n] missing key "${key}"`);
}

/** Test hook: forget which keys have already been warned about. */
export function resetMissingKeyWarnings(): void {
  warned.clear();
}

/**
 * Translate `key` against `dict`. A missing key, or a key that points at a sub-object
 * instead of a string, returns the key itself (and warns once per key outside production).
 */
export function translate(dict: unknown, key: string, params?: TranslateParams): string {
  const v = getPath(dict, key);
  if (typeof v !== "string") {
    warnMissing(key);
    return key;
  }
  return interpolate(v, params);
}
