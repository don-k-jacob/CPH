import Image from "next/image";
import Link from "next/link";

export function EventSessionCard() {
  return (
    <section className="card overflow-hidden p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="ornament">Event Session</span>
          <h2 className="section-heading mt-2 text-3xl font-bold leading-tight">Lent Hack 2026</h2>
          <p className="mt-2 max-w-2xl text-black/72">
            This Lent, don’t just fast. Build. Join a focused maker session for Catholic developers, designers, and creators to ship meaningful tools in community.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-gold/35 bg-accentSoft/60 px-3 py-1">Starts: March 2, 2026</span>
            <span className="rounded-full border border-black/15 bg-white/70 px-3 py-1">6 weekly sessions</span>
            <span className="rounded-full border border-black/15 bg-white/70 px-3 py-1">Remote + Demo Day</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/events" className="btn-primary px-5 py-2.5">View Event</Link>
            <Link href="/submit" className="btn-secondary px-5 py-2.5">Submit Lent Build</Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[240px] rounded-2xl border border-black/10 bg-white/70 p-3 shadow-card md:mx-0">
          <Image src="/lent-hack-logo.png" alt="Lent Hack — This Lent... Don't Just Fast. Build." width={220} height={140} className="h-auto w-full object-contain" />
        </div>
      </div>
    </section>
  );
}
