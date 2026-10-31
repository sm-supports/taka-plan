#!/usr/bin/env node
// First-paint JavaScript budget check (PRD: under 300 KB of JavaScript on first paint).
//
// Loads each page in Playwright's Chromium on a phone-sized viewport with the HTTP cache disabled,
// sums the transfer size (CDP Network.loadingFinished encodedDataLength) of every script response,
// prints a per-URL table and exits 1 when a page is over budget. When the server sends scripts
// without Content-Encoding (Vite preview does), the transfer size is estimated as gzip of the body,
// which is what Cloudflare's edge sends to a phone.
//
// Run against a PRODUCTION build (`npm run build && npm run preview`), not the dev server: dev
// serves unminified modules and would always fail.
//   BASE_URL=http://localhost:8788 node scripts/check-bundle.mjs
//   BUNDLE_LIMIT=300000 overrides the byte budget.
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:8788").replace(/\/$/, "");
const LIMIT = Number(process.env.BUNDLE_LIMIT ?? 300_000);
const PAGES = ["/bn/plan?demo=1", "/"];
const SETTLE_MS = 750;
const SCRIPT_SETTLE_MAX_MS = 10_000;

function isScript(entry) {
  if (entry.type === "Script") return true;
  const mime = (entry.mime ?? "").toLowerCase();
  return mime.includes("javascript") || mime.includes("ecmascript");
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1).padStart(7) + " KB";
}

async function measure(browser, pathname) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

  /** requestId → { url, type, mime, status } */
  const responses = new Map();
  /** requestId → encodedDataLength (bytes on the wire) */
  const finished = new Map();
  cdp.on("Network.responseReceived", (e) => {
    const headers = Object.fromEntries(Object.entries(e.response.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    responses.set(e.requestId, {
      url: e.response.url,
      type: e.type,
      mime: e.response.mimeType,
      status: e.response.status,
      encoded: Boolean(headers["content-encoding"]),
    });
  });
  cdp.on("Network.loadingFinished", (e) => {
    finished.set(e.requestId, e.encodedDataLength);
  });
  cdp.on("Network.loadingFailed", (e) => {
    finished.set(e.requestId, 0);
  });

  const url = BASE_URL + pathname;
  // "load" rather than "networkidle": a long-polling or hanging API call must not stall the check.
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  const deadline = Date.now() + SCRIPT_SETTLE_MAX_MS;
  const scriptsPending = () => [...responses].some(([id, entry]) => isScript(entry) && !finished.has(id));
  do {
    await page.waitForTimeout(SETTLE_MS);
  } while (scriptsPending() && Date.now() < deadline);

  const rows = [];
  for (const [id, entry] of responses) {
    if (!isScript(entry)) continue;
    const wire = finished.get(id) ?? 0;
    let raw = wire;
    let transfer = wire;
    if (!entry.encoded) {
      // Vite preview serves scripts uncompressed; Cloudflare gzips them on the way out.
      // Estimate the on-the-wire size with gzip so the budget matches what a phone downloads.
      try {
        const { body, base64Encoded } = await cdp.send("Network.getResponseBody", { requestId: id });
        const buffer = Buffer.from(body, base64Encoded ? "base64" : "utf8");
        raw = buffer.length;
        transfer = gzipSync(buffer, { level: 6 }).length;
      } catch {
        // Body evicted from the CDP buffer: keep the wire size.
      }
    }
    rows.push({ url: entry.url.replace(BASE_URL, ""), raw, transfer, status: entry.status, estimated: !entry.encoded });
  }
  rows.sort((a, b) => b.transfer - a.transfer);
  await context.close();
  return rows;
}

function printTable(pathname, rows, total) {
  const estimated = rows.some((row) => row.estimated);
  console.log(`\n${pathname}`);
  console.log("-".repeat(90));
  console.log(`${"transfer".padStart(10)}  ${"raw".padStart(10)}  sts  url`);
  for (const row of rows) console.log(`${kb(row.transfer)}  ${kb(row.raw)}  ${String(row.status).padStart(3)}  ${row.url}`);
  console.log("-".repeat(90));
  const verdict = total > LIMIT ? "OVER BUDGET" : "ok";
  console.log(`${kb(total)}  total script transfer (${rows.length} files) — limit ${LIMIT.toLocaleString("en-US")} bytes — ${verdict}`);
  if (estimated) console.log("            transfer = gzip estimate (server sent no Content-Encoding); raw = bytes on disk");
}

async function main() {
  const browser = await chromium.launch();
  let failed = false;
  try {
    for (const pathname of PAGES) {
      const rows = await measure(browser, pathname);
      const total = rows.reduce((sum, row) => sum + row.transfer, 0);
      printTable(pathname, rows, total);
      if (total > LIMIT) failed = true;
    }
  } finally {
    await browser.close();
  }
  if (failed) {
    console.error(`\nBundle check failed: a page shipped more than ${LIMIT} bytes of script.`);
    process.exit(1);
  }
  console.log("\nBundle check passed.");
}

main().catch((error) => {
  console.error(`Bundle check could not run against ${BASE_URL}: ${error instanceof Error ? error.message : String(error)}`);
  console.error("Start a production preview first: npm run build && npm run preview");
  process.exit(1);
});
