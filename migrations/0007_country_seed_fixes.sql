-- Corrections to the v1 country seed (0006), which production applied on 3 Nov 2026 and which is
-- frozen. The JSON in packages/engine/src/data/countries carries the same changes, and
-- test/country-seed.test.ts checks the JSON against every migration.

-- UN WPP figures "for 2026" are annual values: date them mid-year, as Suriname's already are,
-- not 31 Dec 2026, which is in the future.
UPDATE country_fields SET as_of = '2026-07-01'
  WHERE version = 1 AND field = 'life_table_remaining' AND as_of = '2026-12-31'
    AND country IN ('AG', 'AL', 'AM', 'AR', 'BS', 'KN', 'PE', 'PY');

-- The seed went live on 3 Nov 2026, not on the 31 Oct its generator defaulted to.
UPDATE country_versions SET created_at = '2026-11-03', published_at = '2026-11-03'
  WHERE version = 1 AND published_by = 'seed' AND published_at = '2026-10-31';
