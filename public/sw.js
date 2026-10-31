/* Taka Plan service worker. Hand-written (no workbox) so the whole file stays readable.
 *
 * Strategy
 *   install   precache the app shell, every locale's /plan, the manifest, rates and the country index
 *             (each URL independently; a miss never fails install)
 *   navigate  network-first with a 3 s timeout; every successful same-origin HTML page is kept by
 *             pathname, so any page visited online reloads offline. Offline and not kept: the
 *             same-locale /plan shell.
 *   RSC payloads (/{locale}/....txt, /index.txt, what client navigation fetches)
 *             stale-while-revalidate keyed by pathname; the first time one is fetched the page's own
 *             HTML is fetched in the background too, so a page reached by a client-side link also
 *             reloads offline.
 *   /_next/static/*   cache-first (content-hashed, immutable)
 *   /api/rates        stale-while-revalidate
 *   /data/countries/*, /api/countries/*   stale-while-revalidate, keyed by full URL (country profiles)
 *   /admin*, /api/admin*   never cached, never intercepted
 *   everything else   network only
 *   message   { type: "precache", urls: ["/en/plan", ...] } from the page (sent after the language
 *             pick on "/") caches those same-origin pages
 *   activate  drop every other "taka-*" cache, then claim open clients
 *
 * CACHE_VERSION comes from the registration URL (`/sw.js?v=<build id>`, set by RegisterSW from
 * the server's build id), so every deploy gets its own cache and the old one is dropped on
 * activate. Bump SW_REVISION as well whenever the precache list or a strategy changes, so a
 * strategy change invalidates the cache even if the build id were reused.
 */
const SW_REVISION = "r4";
const CACHE_VERSION = ((new URL(self.location.href).searchParams.get("v") || "dev") + "-" + SW_REVISION).replace(/[^A-Za-z0-9._-]/g, "_");
const CACHE_NAME = "taka-" + CACHE_VERSION;
const NAVIGATION_TIMEOUT_MS = 3000;
const LOCALES = ["bn", "en", "hi", "ur", "ar", "es", "fr", "pt", "id", "zh", "ru", "sw"];
/** Keep in sync with LOCALE_PREFIX in lib/i18n/config.ts. */
const PLAN_SHELL = new RegExp("^/(" + LOCALES.join("|") + ")/plan$");
/** RSC payload of a page: /en.txt, /en/m7.txt, /en/start/3.txt, /index.txt. */
const RSC_PAYLOAD = new RegExp("^/(?:(?:" + LOCALES.join("|") + ")(?:/[A-Za-z0-9_-]+)*|index)\\.txt$");
const PRECACHE_URLS = ["/", ...LOCALES.map((l) => "/" + l + "/plan"), "/manifest.webmanifest", "/api/rates", "/data/countries/index.json"];
const DEFAULT_LOCALE = "bn";
const STATIC_PREFIX = "/_next/static/";
const RATES_PATH = "/api/rates";
const COUNTRY_PREFIXES = ["/data/countries/", "/api/countries/"];
const NEVER_CACHE_PREFIXES = ["/admin", "/api/admin"];
const MAX_MESSAGE_URLS = 20;

/** Strips the `redirected` flag so a cached response can answer a navigation (redirect mode "manual"). */
function cacheable(response) {
  if (!response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

function neverCached(pathname) {
  return NEVER_CACHE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function isHtml(response) {
  return (response.headers.get("content-type") || "").includes("text/html");
}

/** Fetches and stores each URL by pathname; a failure skips that URL only. */
async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
        if (response.ok) await cache.put(new URL(url, self.location.origin).pathname, cacheable(response));
      } catch (_) {
        // Offline during install or a route that does not exist yet: skip this URL only.
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheUrls(PRECACHE_URLS).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name.startsWith("taka-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

/** Same-origin page paths only ("/en/plan"), never admin, never anything with a query or another origin. */
function safePagePath(x) {
  if (typeof x !== "string" || !x.startsWith("/") || x.startsWith("//") || x.length > 200) return null;
  let url;
  try {
    url = new URL(x, self.location.origin);
  } catch (_) {
    return null;
  }
  if (url.origin !== self.location.origin || url.search || neverCached(url.pathname) || url.pathname.startsWith("/api/")) return null;
  return url.pathname;
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "precache" || !Array.isArray(data.urls)) return;
  const urls = data.urls.slice(0, MAX_MESSAGE_URLS).map(safePagePath).filter(Boolean);
  if (urls.length) event.waitUntil(cacheUrls(urls));
});

function localeOf(pathname) {
  const first = pathname.split("/")[1];
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Network first; on failure or a slow network, the cached page itself, then the same-locale plan shell.
 *
 * Pages are keyed by pathname only, so only a query-free load may refresh one: a page rendered for
 * `/bn/plan?demo=1` (or any other search string) is served but never stored, which keeps the
 * offline copy the plain `/bn/plan` HTML.
 */
async function handleNavigation(request, url) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS);
    if (response.ok && url.search === "" && isHtml(response)) cache.put(url.pathname, cacheable(response.clone())).catch(() => {});
    return response;
  } catch (_) {
    const exact = await cache.match(url.pathname);
    if (exact) return exact;
    const shell = await cache.match("/" + localeOf(url.pathname) + "/plan");
    if (shell) return shell;
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone()).catch(() => {});
  return response;
}

/** Cached copy under `key` at once (refreshed in the background); the network when there is none. */
async function staleWhileRevalidate(request, key) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(key);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(key, response.clone()).catch(() => {});
      return response;
    })
    .catch(() => null);
  if (hit) return hit;
  const fresh = await refresh;
  return fresh || new Response("", { status: 503 });
}

/** "/en/m7.txt" → "/en/m7"; "/index.txt" → "/". */
function pageOfPayload(pathname) {
  return pathname === "/index.txt" ? "/" : pathname.slice(0, -".txt".length);
}

/** Keeps the HTML of a page reached by client navigation, once, so a later offline reload finds it. */
async function warmPage(pathname) {
  const cache = await caches.open(CACHE_NAME);
  if (await cache.match(pathname)) return;
  try {
    const response = await fetch(new Request(pathname, { credentials: "same-origin" }));
    if (response.ok && isHtml(response)) await cache.put(pathname, cacheable(response));
  } catch (_) {
    // offline: nothing to keep
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (neverCached(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));
    return;
  }
  if (url.pathname.startsWith(STATIC_PREFIX)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (RSC_PAYLOAD.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, url.pathname));
    event.waitUntil(warmPage(pageOfPayload(url.pathname)));
    return;
  }
  if (url.pathname === RATES_PATH) {
    event.respondWith(staleWhileRevalidate(request, RATES_PATH));
    return;
  }
  if (COUNTRY_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(staleWhileRevalidate(request, url.href));
    return;
  }
  // Everything else: network only (no respondWith → default browser fetch).
});
