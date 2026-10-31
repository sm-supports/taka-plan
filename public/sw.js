/* Taka Plan service worker. Hand-written (no workbox) so the whole file stays readable.
 *
 * Strategy
 *   install   precache the app shell + manifest + rates (each URL independently; a miss never fails install)
 *   navigate  network-first with a 3 s timeout, then the cached same-locale /plan shell
 *   /_next/static/*   cache-first (content-hashed, immutable)
 *   /api/rates        stale-while-revalidate
 *   /admin*, /api/admin*   never cached, never intercepted
 *   everything else   network only
 *   activate  drop every other "taka-*" cache, then claim open clients
 *
 * CACHE_VERSION comes from the registration URL (`/sw.js?v=<build id>`, set by RegisterSW from
 * the server's build id), so every deploy gets its own cache and the old one is dropped on
 * activate. Bump SW_REVISION as well whenever the precache list or a strategy changes, so a
 * strategy change invalidates the cache even if the build id were reused.
 */
const SW_REVISION = "r3";
const CACHE_VERSION = ((new URL(self.location.href).searchParams.get("v") || "dev") + "-" + SW_REVISION).replace(/[^A-Za-z0-9._-]/g, "_");
const CACHE_NAME = "taka-" + CACHE_VERSION;
const PRECACHE_URLS = ["/", "/bn/plan", "/en/plan", "/manifest.webmanifest", "/api/rates"];
const NAVIGATION_TIMEOUT_MS = 3000;
const LOCALES = ["bn", "en", "hi", "ur", "ar", "es", "fr", "pt", "id", "zh", "ru", "sw"];
/** Keep in sync with LOCALE_PREFIX in lib/i18n/config.ts. */
const PLAN_SHELL = new RegExp("^/(" + LOCALES.join("|") + ")/plan$");
const DEFAULT_LOCALE = "bn";
const STATIC_PREFIX = "/_next/static/";
const RATES_PATH = "/api/rates";
const NEVER_CACHE_PREFIXES = ["/admin", "/api/admin"];

/** Strips the `redirected` flag so a cached response can answer a navigation (redirect mode "manual"). */
function cacheable(response) {
  if (!response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    PRECACHE_URLS.map(async (url) => {
      try {
        const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
        if (response.ok) await cache.put(url, cacheable(response));
      } catch (_) {
        // Offline during install or a route that does not exist yet: skip this URL only.
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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
 * Shell entries are keyed by pathname only, so only a query-free load may refresh one: a page
 * rendered for `/bn/plan?demo=1` (or any other search string) is served but never stored, which
 * keeps the offline shell the plain `/bn/plan` HTML.
 */
async function handleNavigation(request, url) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await withTimeout(fetch(request), NAVIGATION_TIMEOUT_MS);
    const isShell = PRECACHE_URLS.includes(url.pathname) || PLAN_SHELL.test(url.pathname);
    if (response.ok && isShell && url.search === "") cache.put(url.pathname, cacheable(response.clone())).catch(() => {});
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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(RATES_PATH);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(RATES_PATH, response.clone()).catch(() => {});
      return response;
    })
    .catch(() => null);
  if (hit) return hit;
  const fresh = await refresh;
  return fresh || new Response("", { status: 503 });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER_CACHE_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + "/"))) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));
    return;
  }
  if (url.pathname.startsWith(STATIC_PREFIX)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname === RATES_PATH) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  // Everything else: network only (no respondWith → default browser fetch).
});
