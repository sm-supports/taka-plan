import type { MetadataRoute } from "next";

/**
 * Web app manifest, served by vinext at /manifest.webmanifest.
 * Colours mirror app/globals.css tokens: --color-page (background) and --color-brand-600 (theme).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taka Plan",
    short_name: "Taka Plan",
    description: "A free Bangla/English personal-finance planner for Bangladesh.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "bn",
    dir: "ltr",
    background_color: "#f6f8f7",
    theme_color: "#0b7f6d",
    categories: ["finance", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
