#!/bin/sh
# Smoke test against a running dev/preview server: /api/health must report a healthy D1
# and /api/rates must serve a published version from it. Usage: PORT=3001 sh scripts/smoke.sh
set -u

BASE="http://localhost:${PORT:-3001}"
TMP=$(mktemp -d 2>/dev/null || mktemp -d -t taka-smoke)
trap 'rm -rf "$TMP"' EXIT

fail() {
  echo "SMOKE FAIL ($BASE): $*"
  exit 1
}

# Extracts a JSON string or number field from a one-object document (jq when present, sed otherwise).
field() {
  if command -v jq >/dev/null 2>&1; then
    jq -r ".$2 // empty" "$1" 2>/dev/null
  else
    sed -n "s/.*\"$2\":\"\{0,1\}\([^\",}]*\)\"\{0,1\}[,}].*/\1/p" "$1" | head -n 1
  fi
}

header() {
  tr -d '\r' < "$1" | awk -v h="$2" 'BEGIN { IGNORECASE = 1 } tolower($0) ~ "^" tolower(h) ":" { sub(/^[^:]*:[ \t]*/, ""); print; exit }'
}

curl -fsS "$BASE/api/health" -o "$TMP/health.json" || fail "GET /api/health did not answer 2xx"
db=$(field "$TMP/health.json" db)
published=$(field "$TMP/health.json" publishedVersion)
rates_source_health=$(field "$TMP/health.json" ratesSource)
[ "$db" = "ok" ] || fail "health db=\"$db\" (expected ok): $(cat "$TMP/health.json")"
case "$published" in
  ''|*[!0-9]*) fail "health publishedVersion=\"$published\" is not a number" ;;
esac
[ "$published" -ge 1 ] || fail "health publishedVersion=$published (expected >= 1)"

curl -fsS -D "$TMP/rates.headers" "$BASE/api/rates" -o "$TMP/rates.json" || fail "GET /api/rates did not answer 2xx"
version=$(field "$TMP/rates.json" version)
case "$version" in
  ''|*[!0-9]*) fail "rates version=\"$version\" is not a number" ;;
esac
[ "$version" -ge 1 ] || fail "rates version=$version (expected >= 1)"
[ "$version" -eq "$published" ] || fail "rates version=$version differs from health publishedVersion=$published"
source=$(header "$TMP/rates.headers" X-Rates-Source)
[ -n "$source" ] || fail "X-Rates-Source header missing on /api/rates"
[ "$source" = "d1" ] || fail "X-Rates-Source=$source (expected d1 while db=ok)"
etag=$(header "$TMP/rates.headers" ETag)
[ -n "$etag" ] || fail "ETag header missing on /api/rates"
rows=$(grep -o '"key":' "$TMP/rates.json" | wc -l | tr -d ' ')
[ "$rows" -ge 1 ] || fail "rates body has no rows"

code=$(curl -sS -o /dev/null -w '%{http_code}' -H "If-None-Match: $etag" "$BASE/api/rates")
[ "$code" = "304" ] || fail "If-None-Match $etag answered $code (expected 304)"

echo "SMOKE OK ($BASE): db=$db publishedVersion=$published ratesSource=$rates_source_health rates=v$version rows=$rows source=$source etag=$etag 304=yes"
