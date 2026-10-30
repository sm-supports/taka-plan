import type { en } from "./dictionaries/en";

/** Turns every string-literal leaf of a nested object into `string`, keeping the key shape. */
export type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

/**
 * The dictionary shape, derived from the English source of truth.
 * `bn` is typed against this, so a missing or extra Bangla key is a type error.
 */
export type Dictionary = DeepStringify<typeof en>;

export type Namespace = keyof Dictionary;

/** Values the UI substitutes into `{placeholder}` slots; already formatted by useFormat. */
export type TranslateParams = Record<string, string | number>;
