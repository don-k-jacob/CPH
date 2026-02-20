import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinEventForm } from "@/components/events/join-event-form";
import { getCurrentUser } from "@/lib/auth";
import { getEventBySlug } from "@/lib/events-config";
import {
  getEventApplicationForUser,
  getEventRegistrationByUser,
  refreshEventApplicationTeamStatuses
} from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Register" };
  return { title: `Register | ${event.title} | Catholic Product Hunt` };
}

async function getRegisterData(slug: string) {
  const currentUser = await getCurrentUser().catch(() => null);
  let registration: Awaited<ReturnType<typeof getEventRegistrationByUser>> = null;
  let application: Awaited<ReturnType<typeof getEventApplicationForUser>> = null;
  try {
    const [reg, appData] = await Promise.all([
      currentUser ? getEventRegistrationByUser(slug, currentUser.id) : Promise.resolve(null),
      currentUser ? getEventApplicationForUser(slug, currentUser) : Promise.resolve(null)
    ]);
    registration = reg;
    if (appData) {
      const teamMembers = await refreshEventApplicationTeamStatuses(appData.teamMembers);
      application = { ...appData, teamMembers };
    } else {
      application = null;
    }
  } catch {
    // Firebase unavailable
  }
  return { currentUser, registration, application };
}

export default async function EventRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const eventConfig = getEventBySlug(slug);

  if (!eventConfig) {
    notFound();
  }

  const { currentUser, registration, application } = await getRegisterData(slug);

  return (
    <div className="min-w-0 space-y-6">
      <Link
        href={`/events/${slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        ← Back to {eventConfig.title}
      </Link>
      <div className="card min-w-0 border-accent/30 bg-accentSoft/30 p-4 sm:p-6 md:p-8">
        <h2 className="mb-2 text-xl font-bold text-ink">Register for {eventConfig.title}</h2>
        <p className="mb-6 text-black/75">
          Join the hackathon by creating an account and completing the form below.
        </p>
        <JoinEventForm
          eventSlug={slug}
          eventTitle={eventConfig.title}
          isLoggedIn={Boolean(currentUser)}
          isRegistered={Boolean(registration)}
          initialRegistration={
            registration
              ? {
                  participationType: registration.participationType,
                  teamName: registration.teamName,
                  projectName:
                    registration.projectName ||
                    application?.sections?.companyName ||
                    "",
                  skills: registration.skills ?? [],
                  bio: registration.bio ?? "",
                  teammatePreference: registration.teammatePreference,
                  referralSource: registration.referralSource
                }
              : null
          }
          currentUserUsername={currentUser?.username ?? null}
        />
      </div>
    </div>
  );
}
