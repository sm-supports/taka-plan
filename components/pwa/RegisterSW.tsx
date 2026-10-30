"use client";
/**
 * Registers /sw.js in production builds only (Vite inlines process.env.NODE_ENV, so the dev
 * build never touches the service worker) and shows a small "new version" toast when an updated
 * worker has installed behind a page that is already controlled. Sits outside [locale], so the
 * toast copy is bilingual and hardcoded.
 */
import { useEffect, useState } from "react";

function watchInstall(worker: ServiceWorker, onInstalled: () => void): void {
  worker.addEventListener("statechange", () => {
    if (worker.state === "installed" && navigator.serviceWorker.controller) onInstalled();
  });
}

export function RegisterSW() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    let disposed = false;
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          if (disposed) return;
          const markReady = () => setUpdateReady(true);
          if (registration.waiting && navigator.serviceWorker.controller) markReady();
          if (registration.installing) watchInstall(registration.installing, markReady);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            if (worker) watchInstall(worker, markReady);
          });
        })
        .catch(() => {
          // Registration failures (private mode, unsupported scope) never break the app.
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", register);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="pointer-events-auto min-h-12 w-full max-w-md rounded-2xl bg-brand-900 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg"
      >
        <span lang="bn">নতুন সংস্করণ এসেছে — রিলোড করতে চাপুন</span>
        <span aria-hidden="true"> · </span>
        <span lang="en">New version — tap to reload</span>
      </button>
    </div>
  );
}
