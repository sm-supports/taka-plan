import type { Metadata, Viewport } from "next";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { LOCALE_META, defaultLocale, locales } from "@/lib/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taka Plan",
  description: "A free personal-finance planner in your country's currency and your language: a full savings plan from five questions in under three minutes, no account needed.",
  applicationName: "Taka Plan",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b7f6d",
};

/** vinext sets __VINEXT_BUILD_ID on the server for production builds; BUILD_ID is an escape hatch for other hosts. */
function buildId(): string {
  return process.env.__VINEXT_BUILD_ID ?? process.env.BUILD_ID ?? "dev";
}

/**
 * The root layout is locale-agnostic, so the exported HTML always starts with the default lang and
 * dir. This inline script fixes both from the URL's locale prefix before first paint (no
 * left-to-right flash on /ar or /ur); HtmlLang keeps them in sync after client navigation.
 */
const LANG_DIR = Object.fromEntries(locales.map((l) => [l, [LOCALE_META[l].tag, LOCALE_META[l].dir]]));
const LANG_SCRIPT = `(function(){try{var m=/^\\/([a-z]{2})(?=\\/|$)/.exec(location.pathname),t=${JSON.stringify(LANG_DIR)},v=m&&t[m[1]];if(v){var h=document.documentElement;h.lang=v[0];h.dir=v[1];}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={LOCALE_META[defaultLocale].tag} dir={LOCALE_META[defaultLocale].dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
      </head>
      <body>
        {children}
        <RegisterSW buildId={buildId()} />
      </body>
    </html>
  );
}
