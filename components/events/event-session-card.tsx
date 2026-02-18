import Image from "next/image";
import Link from "next/link";

export function EventSessionCard() {
  return (
    <section className="card min-w-0 overflow-hidden p-4 sm:p-5 md:p-7">
      <div className="grid min-w-0 gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <span className="ornament">Event Session</span>
          <h2 className="section-heading mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl">Lent Hack 2026</h2>
          <p className="mt-2 max-w-2xl break-words text-black/72">
            Build What&apos;s Eternal. This Lent, don&apos;t just give up something—build something. A 50-day challenge for developers, designers, and innovators to create products that serve the Kingdom.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-gold/35 bg-accentSoft/60 px-3 py-1">Launch: Ash Wednesday (Feb 18, 2026)</span>
            <span className="rounded-full border border-black/15 bg-white/70 px-3 py-1">50-day build</span>
            <span className="rounded-full border border-black/15 bg-white/70 px-3 py-1">Submit by Easter Week</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/events" className="btn-primary px-5 py-2.5">View Event</Link>
            <Link href="/submit" className="btn-secondary px-5 py-2.5">Submit Lent Build</Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[240px] rounded-2xl border border-black/10 bg-white/70 p-3 shadow-card md:mx-0">
          <Image src="/lent-hack-logo.png" alt="Lent Hack — Build What's Eternal." width={220} height={140} className="h-auto w-full object-contain" />
        </div>
      </div>
    </section>
  );
}
