import Image from "next/image";
import Link from "next/link";
import { BackendWarning } from "@/components/backend-warning";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getAllEvents } from "@/lib/events-config";

export const dynamic = "force-dynamic";

export default async function EventsIndexPage() {
  try {
    const events = getAllEvents();

    return (
      <section className="space-y-8">
        <div>
          <span className="ornament">Hackathons & Sprints</span>
          <h1 className="section-heading mt-2 text-4xl font-bold">Events</h1>
          <p className="mt-2 max-w-2xl text-black/72">
            Join time-bound builds and showcases. Participate in public hackathons and community sprints.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-black/60">No events are listed yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="group block overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-32 items-center justify-center border-b border-black/10 bg-gradient-to-br from-ink/8 to-ink/4">
                  {event.imagePath ? (
                    <Image
                      src={event.imagePath}
                      alt={event.imageAlt ?? event.title}
                      width={200}
                      height={100}
                      className="max-h-full max-w-full object-contain object-center opacity-90 transition group-hover:opacity-100"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-black/20" style={{ fontFamily: "var(--font-display)" }}>
                      {event.title.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="section-heading text-xl font-bold text-ink">{event.title}</h2>
                  {event.tagline ? (
                    <p className="mt-1 text-sm font-medium text-black/70">{event.tagline}</p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm text-black/65">{event.description}</p>
                  <p className="mt-3 text-xs font-medium text-black/55">{event.dateRange}</p>
                  {event.tracks && event.tracks.length > 0 ? (
                    <p className="mt-1 text-xs text-black/50">{event.tracks.slice(0, 3).join(" · ")}</p>
                  ) : null}
                  <span className="mt-4 inline-block text-sm font-semibold text-accent group-hover:underline">
                    Join event →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    return (
      <section className="space-y-4">
        <h1 className="section-heading text-4xl font-bold">Events</h1>
        <BackendWarning message={getBackendErrorMessage(error)} />
      </section>
    );
  }
}
