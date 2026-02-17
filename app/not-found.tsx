import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="card mx-auto max-w-2xl space-y-4 p-7 text-center">
      <span className="ornament">404</span>
      <h1 className="section-heading text-4xl font-bold">Page Not Found</h1>
      <p className="text-black/70">The page you requested does not exist or may have been moved.</p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="btn-primary px-5 py-2.5 text-sm">
          Back Home
        </Link>
        <Link href="/events" className="btn-secondary px-5 py-2.5 text-sm">
          View Events
        </Link>
      </div>
    </section>
  );
}
