"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="container py-10">
          <section className="card space-y-4 p-6">
            <p className="ornament">Unexpected Error</p>
            <h1 className="section-heading text-3xl font-bold">Something went wrong</h1>
            <p className="text-black/70">An unexpected issue occurred while loading this page.</p>
            <button onClick={reset} className="btn-primary px-5 py-2.5 text-sm">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
