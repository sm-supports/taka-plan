import Link from "next/link";

/** Bilingual 404 for unknown routes and unknown locale segments. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-6xl font-bold text-brand-700" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text" lang="bn">
        পাতাটি পাওয়া যায়নি
      </h1>
      <p className="text-lg text-text-muted" lang="en">
        Page not found
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Link href="/bn" lang="bn" className="tap inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 text-base font-semibold text-white hover:bg-brand-700">
          শুরুতে ফিরে যান
        </Link>
        <Link href="/en" lang="en" className="tap inline-flex items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted">
          Back to start
        </Link>
      </div>
    </main>
  );
}
