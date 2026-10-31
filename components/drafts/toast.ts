/**
 * A one-line status toast ("Saved as a draft") that survives the client-side navigation which
 * follows "Start from the beginning": the button unmounts with the page, so the toast lives in a
 * single live region appended to <body>, outside the React tree, and hides itself after a few seconds.
 */
const TOAST_ID = "tp-drafts-toast";
const SHOW_MS = 4000;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function showDraftToast(text: string): void {
  if (typeof document === "undefined" || !text) return;
  let el = document.getElementById(TOAST_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = TOAST_ID;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("data-testid", "drafts-toast");
    el.className =
      "pointer-events-none fixed inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl bg-brand-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg";
    el.hidden = true;
    document.body.appendChild(el);
  }
  const region = el;
  // Clear first, then write on the next frame, so screen readers announce a repeated message too.
  region.textContent = "";
  region.hidden = false;
  const write = () => {
    region.textContent = text;
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(write);
  else write();
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    region.textContent = "";
    region.hidden = true;
  }, SHOW_MS);
}
