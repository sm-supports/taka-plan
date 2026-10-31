/// <reference types="vite/client" />
// The Bangladesh profile that ships inside the bundle, so first paint and offline use never wait.
// packages/engine/src/data/countries/BD.json is picked up when the research workflow has written it
// (import.meta.glob matches nothing, without failing the build, while the file is absent); until
// then, and if the file is invalid, the hand-made FIXTURE_BD is used.
import { FIXTURE_BD, type CountryProfile } from "@taka/engine";
import { parseCountryBody, type LoadedCountry } from "./loader";

const files = import.meta.glob<unknown>("../../packages/engine/src/data/countries/BD.json", { eager: true, import: "default" });

/** Pick the BD data file when present and valid; exported for tests. */
export function bundledFrom(found: Record<string, unknown>, fallback: CountryProfile = FIXTURE_BD): LoadedCountry {
  for (const body of Object.values(found)) {
    try {
      return { ...parseCountryBody(body, "bundled", "BD"), version: 0 };
    } catch {
      // invalid file: fall through to the fixture
    }
  }
  return { profile: fallback, version: 0, source: "bundled" };
}

export const BUNDLED_BD: LoadedCountry = bundledFrom(files);
