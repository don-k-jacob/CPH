import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventPageTabs } from "@/components/events/event-page-tabs";
import { TeammateBoard } from "@/components/events/teammate-board";
import { getCurrentUser } from "@/lib/auth";
import { getEventBySlug } from "@/lib/events-config";
import {
  type EventRegistrationRecord,
  getEventApplicationByUser,
  getEventRegistrationByUser,
  getEventRegistrations,
  getEventStats,
  getTeammatePosts,
  refreshEventApplicationTeamStatuses
} from "@/lib/firebase-db";
import { ParticipantsPanel } from "@/components/events/participants-panel";
import { EventApplicationForm } from "@/components/events/event-application-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event" };
  return { title: `${event.title} | Catholic Product Hunt` };
}

function getNavItems(participantCount: number, isRegistered: boolean) {
  const base = [
    { id: "overview", label: "Overview" },
    { id: "participants", label: `Participants (${participantCount})` },
    { id: "timeline", label: "Timeline" },
    { id: "rules", label: "Rules" }
  ];
  return isRegistered ? [...base, { id: "application", label: "Application" }] : base;
}

async function getEventData(slug: string) {
  const currentUser = await getCurrentUser().catch(() => null);
  let registration: EventRegistrationRecord | null = null;
  let application: Awaited<ReturnType<typeof getEventApplicationByUser>> | null = null;
  let posts: Awaited<ReturnType<typeof getTeammatePosts>> = [];
  let participants: Awaited<ReturnType<typeof getEventRegistrations>> = [];
  let stats = { registrations: 0, teams: 0, individuals: 0, teammatePosts: 0 };
  try {
    const [reg, appData, postsData, participantsData, statsData] = await Promise.all([
      currentUser ? getEventRegistrationByUser(slug, currentUser.id) : Promise.resolve(null),
      currentUser ? getEventApplicationByUser(slug, currentUser.id) : Promise.resolve(null),
      getTeammatePosts(slug),
      getEventRegistrations(slug),
      getEventStats(slug)
    ]);
    registration = reg;
    if (appData) {
      const teamMembers = await refreshEventApplicationTeamStatuses(appData.teamMembers);
      application = { ...appData, teamMembers };
    } else {
      application = null;
    }
    posts = postsData;
    participants = participantsData;
    stats = statsData;
  } catch (err) {
    // Firebase unavailable: show page with zero stats and empty lists
    if (process.env.NODE_ENV === "development") {
      console.error("[events] getEventData failed for slug=%s:", slug, err);
    }
  }
  return { currentUser, registration, application, posts, participants, stats };
}

export default async function EventBySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const eventConfig = getEventBySlug(slug);

  if (!eventConfig) {
    notFound();
  }

  const { currentUser, registration, application, posts, participants, stats } = await getEventData(slug);
  const totalRegistrations = stats.registrations;
  const participantCount = participants.length;
  const isRegistered = Boolean(currentUser && registration);
  const NAV_ITEMS = getNavItems(participantCount, isRegistered);

  return (
    <div className="min-w-0 space-y-8">
        {/* Hero — Devpost-style */}
        <header className="relative overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-ink/95 to-ink text-white shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14">
            <div className="mx-auto max-w-4xl min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Seasonal Program
              </p>
              <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
                {eventConfig.title}
              </h1>
              {eventConfig.tagline ? (
                <p className="mt-3 break-words text-lg text-white/90 sm:text-xl md:text-2xl">{eventConfig.tagline}</p>
              ) : null}
              <p className="mt-4 text-sm text-white/70 sm:text-base">{eventConfig.dateRange}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {!isRegistered ? (
                  <Link
                    href={`/events/${slug}/register`}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-ink shadow-md transition hover:bg-white/90 active:scale-[0.98]"
                  >
                    Join hackathon
                  </Link>
                ) : null}
                <Link
                  href="/products"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  See community builds
                </Link>
              </div>
              {eventConfig.imagePath ? (
                <div className="mt-8 flex justify-end">
                  <Image
                    src={eventConfig.imagePath}
                    alt={eventConfig.imageAlt ?? eventConfig.title}
                    width={220}
                    height={140}
                    className="max-h-28 w-auto object-contain opacity-95"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Stats bar — Devpost-style: Location | Format | Participants | Prizes/Tracks */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-black/10 pb-4 text-xs text-black/80 sm:gap-x-4 sm:text-sm">
          {eventConfig.location ? <span className="font-medium text-ink">{eventConfig.location}</span> : null}
          {eventConfig.location && eventConfig.format ? <span className="text-black/40">|</span> : null}
          {eventConfig.format ? <span>{eventConfig.format}</span> : null}
          <span className="text-black/40">|</span>
          <span className="font-semibold text-ink">{totalRegistrations} participants</span>
          {eventConfig.prizes && eventConfig.prizes.length > 0 ? (
            <>
              <span className="text-black/40">|</span>
              <span className="font-medium text-ink">{eventConfig.prizes[0]?.label}</span>
            </>
          ) : null}
          {eventConfig.tracks && eventConfig.tracks.length > 0 ? (
            <>
              <span className="text-black/40">|</span>
              <span>{eventConfig.tracks.join(" · ")}</span>
            </>
          ) : null}
        </div>

        <div id="event-tabs" className="mt-6">
          <EventPageTabs tabs={NAV_ITEMS}>
            {/* Panel 0: Overview */}
            <div className="space-y-6">
              {eventConfig.about && eventConfig.about.length > 0 ? (
                <div className="card p-6">
                  <h3 className="font-bold text-ink">About the challenge</h3>
                  <div className="mt-3 space-y-3 text-black/80">
                    {eventConfig.about.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card p-6">
                  <p className="text-black/80">{eventConfig.description}</p>
                </div>
              )}

              {(eventConfig.whatToBuild ?? eventConfig.whatToSubmit) && (
                <div className="card p-6">
                  <h3 className="font-bold text-ink">Requirements</h3>
                  {eventConfig.whatToBuild ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/55">What to build</p>
                      <p className="mt-1 text-black/80">{eventConfig.whatToBuild}</p>
                    </div>
                  ) : null}
                  {eventConfig.whatToSubmit && eventConfig.whatToSubmit.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/55">What to submit</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-black/80">
                        {eventConfig.whatToSubmit.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              )}

              {eventConfig.whoCanParticipate ? (
                <div className="rounded-xl border border-black/10 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/55">Who can participate</p>
                  <p className="mt-1 text-black/80">{eventConfig.whoCanParticipate}</p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {eventConfig.sections.map(({ title, body }) => (
                  <article key={title} className="card p-4">
                    <h3 className="section-heading font-bold text-ink">{title}</h3>
                    <p className="mt-2 text-sm text-black/70">{body}</p>
                  </article>
                ))}
              </div>

              {eventConfig.prizes && eventConfig.prizes.length > 0 ? (
                <div>
                  <h3 className="section-heading text-lg font-bold">Prizes</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {eventConfig.prizes.map((p) => (
                      <div key={p.label} className="card p-4">
                        <p className="font-bold text-ink">{p.label}</p>
                        {p.detail ? <p className="mt-1 text-sm text-black/70">{p.detail}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {eventConfig.judgingCriteria && eventConfig.judgingCriteria.length > 0 ? (
                <div>
                  <h3 className="section-heading text-lg font-bold">Judging criteria</h3>
                  <ul className="mt-3 space-y-3">
                    {eventConfig.judgingCriteria.map((c) => (
                      <li key={c.name} className="card p-4">
                        <p className="font-bold text-ink">{c.name}</p>
                        <p className="mt-1 text-sm text-black/70">{c.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {eventConfig.judges && eventConfig.judges.length > 0 ? (
                <div>
                  <h3 className="section-heading text-lg font-bold">Judges</h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {eventConfig.judges.map((j) => (
                      <div key={j.name} className="rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm">
                        <span className="font-semibold">{j.name}</span>
                        {j.role ? <span className="text-black/60"> · {j.role}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Panel 1: Participants */}
            <div className="space-y-6">
              <p className="text-black/70">
                {totalRegistrations} registered · Find teammates or register via the button above to join.
              </p>
              <ParticipantsPanel
                eventSlug={slug}
                initialParticipants={participants.map((r) => ({
                  userId: r.userId || r.id,
                  userName: r.user?.name ?? r.userName ?? "",
                  username: r.user?.username ?? r.userUsername ?? "",
                  avatarUrl: r.user?.avatarUrl ?? r.userAvatarUrl ?? null,
                  bio: r.user?.bio ?? r.userBio ?? null,
                  participationType: r.participationType,
                  teamName: r.teamName,
                  projectName: r.projectName ?? "",
                  skills: r.skills ?? [],
                  teammatePreference: r.teammatePreference ?? null
                }))}
                currentUserId={currentUser?.id ?? null}
              />
              <TeammateBoard
                eventSlug={slug}
                eventTitle={eventConfig.title}
                isLoggedIn={Boolean(currentUser)}
                currentUserId={currentUser?.id ?? null}
                isRegistered={Boolean(
                  currentUser && registration
                )}
                posts={posts.map((post) => ({
                  id: post.id,
                  userId: post.userId,
                  userName: post.user?.name ?? "Unknown",
                  username: post.user?.username ?? "unknown",
                  participationType: post.participationType,
                  lookingFor: post.lookingFor,
                  message: post.message,
                  createdAt: post.createdAt
                }))}
              />
            </div>

            {/* Panel 2: Timeline */}
            <div className="space-y-4">
              {eventConfig.scheduleUrl ? (
                <Link
                  href={eventConfig.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-semibold text-accent hover:underline"
                >
                  View schedule →
                </Link>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                {eventConfig.timeline.map((item) => (
                  <div key={item} className="rounded-xl border border-black/10 bg-white/70 p-3 text-sm text-black/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 3: Rules */}
            <div className="space-y-4">
              {eventConfig.rulesUrl ? (
                <a
                  href={eventConfig.rulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  View full rules →
                </a>
              ) : (
                <p className="text-black/70">Register via the event page to participate. Team or individual—all builders welcome.</p>
              )}
            </div>

            {/* Panel 4: Application (only when registered) */}
            {isRegistered ? (
              <div id="application" className="min-w-0">
                <EventApplicationForm
                  eventSlug={slug}
                  tracks={eventConfig.tracks}
                  initialApplication={
                    application
                      ? {
                          status: application.status,
                          submittedAt: application.submittedAt,
                          teamMembers: application.teamMembers,
                          sections: application.sections
                        }
                      : null
                  }
                />
              </div>
            ) : null}
          </EventPageTabs>
        </div>
      </div>
  );
}
