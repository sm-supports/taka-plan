-- Country reference data (Taka Plan v2). One row set per country and version; each country has its
-- own draft and publish cycle so an edit to one country never copies the other ~196.
-- Static copies of the published data ship in public/data/countries/<CC>.json for offline use.

CREATE TABLE IF NOT EXISTS country_versions (
  country      TEXT    NOT NULL CHECK (length(country) = 2 AND country = upper(country)),
  version      INTEGER NOT NULL CHECK (version >= 1),
  status       TEXT    NOT NULL CHECK (status IN ('draft', 'published', 'superseded')),
  created_at   TEXT    NOT NULL,
  published_at TEXT,
  published_by TEXT,
  note         TEXT,
  -- Identity, currency, languages, instruments and institutions (CountryProfile minus `fields`), as JSON.
  meta         TEXT    NOT NULL,
  PRIMARY KEY (country, version)
);
CREATE UNIQUE INDEX IF NOT EXISTS country_versions_one_published ON country_versions(country) WHERE status = 'published';
CREATE UNIQUE INDEX IF NOT EXISTS country_versions_one_draft ON country_versions(country) WHERE status = 'draft';

-- One researched figure per country, version and rate key (packages/engine/src/country/fields.ts).
CREATE TABLE IF NOT EXISTS country_fields (
  country     TEXT    NOT NULL,
  version     INTEGER NOT NULL,
  field       TEXT    NOT NULL,
  value       REAL,
  value_json  TEXT,
  status      TEXT    NOT NULL CHECK (status IN ('sourced', 'assumption', 'missing')),
  source_name TEXT    NOT NULL,
  source_url  TEXT    NOT NULL,
  as_of       TEXT    NOT NULL,
  note        TEXT,
  -- 1 when research confirmed the thing does not exist (no term-life market, no gratuity law, ...);
  -- only allowed with status 'missing'. 0 = unknown or not applicable.
  absent      INTEGER NOT NULL DEFAULT 0 CHECK (absent IN (0, 1)),
  PRIMARY KEY (country, version, field),
  FOREIGN KEY (country, version) REFERENCES country_versions(country, version) ON DELETE CASCADE,
  CHECK (status = 'missing' OR value IS NOT NULL OR value_json IS NOT NULL),
  CHECK (absent = 0 OR status = 'missing')
);

-- Change log entries for country edits carry the country code (NULL for the Bangladesh rates table).
ALTER TABLE change_log ADD COLUMN country TEXT;
CREATE INDEX IF NOT EXISTS change_log_country_at ON change_log(country, at DESC);
