-- Taka Plan rates table: versioned assumptions with a change log.
-- Published versions are immutable; edits create a draft (N+1) that is published atomically.

CREATE TABLE IF NOT EXISTS rate_versions (
  version      INTEGER PRIMARY KEY,
  status       TEXT NOT NULL CHECK (status IN ('draft', 'published', 'superseded')),
  created_at   TEXT NOT NULL,
  published_at TEXT,
  published_by TEXT,
  note         TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS rate_versions_one_published ON rate_versions(status) WHERE status = 'published';
CREATE UNIQUE INDEX IF NOT EXISTS rate_versions_one_draft     ON rate_versions(status) WHERE status = 'draft';

CREATE TABLE IF NOT EXISTS rates (
  version           INTEGER NOT NULL REFERENCES rate_versions(version) ON DELETE CASCADE,
  key               TEXT    NOT NULL,
  value             REAL,
  value_json        TEXT,
  unit              TEXT    NOT NULL CHECK (unit IN ('rate', 'bdt', 'years', 'months', 'ratio', 'json')),
  range_low         REAL,
  range_high        REAL,
  label_en          TEXT    NOT NULL,
  label_bn          TEXT,
  source_name       TEXT    NOT NULL,
  source_url        TEXT    NOT NULL,
  as_of             TEXT    NOT NULL,
  reviewed_by       TEXT    NOT NULL,
  next_review       TEXT    NOT NULL,
  note              TEXT,
  is_app_assumption INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (version, key),
  CHECK (value IS NOT NULL OR value_json IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS change_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  at        TEXT NOT NULL,
  actor     TEXT NOT NULL DEFAULT 'admin',
  action    TEXT NOT NULL CHECK (action IN ('create_draft', 'edit', 'publish', 'discard_draft')),
  version   INTEGER NOT NULL,
  key       TEXT,
  old_value TEXT,
  new_value TEXT,
  note      TEXT
);
CREATE INDEX IF NOT EXISTS change_log_at ON change_log(at DESC);
