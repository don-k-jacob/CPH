import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import {
  type EventApplicationSections,
  type EventApplicationTeamMember,
  getEventApplicationByUser,
  getEventRegistrationByUser,
  refreshEventApplicationTeamStatuses,
  upsertEventApplicationDraft
} from "@/lib/firebase-db";

const teamMemberSchema = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  userId: z.string().nullable().optional(),
  status: z.enum(["invited", "profile_incomplete", "complete"]).optional()
});

const sectionsSchema: z.ZodType<EventApplicationSections> = z.object({
  foundersKnownHowLong: z.string().optional(),
  whoWritesCode: z.string().optional(),
  lookingForCofounder: z.string().optional(),
  founderVideoUrl: z.string().optional(),
  companyName: z.string().optional(),
  tagline50: z.string().max(50).optional(),
  companyUrl: z.string().optional(),
  demoVideoUrl: z.string().optional(),
  demoFileUrl: z.string().optional(),
  productLink: z.string().optional(),
  productLinkCredentials: z.string().optional(),
  whatWillYouMake: z.string().optional(),
  location: z.string().optional(),
  locationReason: z.string().optional(),
  howFarAlong: z.string().optional(),
  howLongWorking: z.string().optional(),
  techStack: z.string().optional(),
  codingSessionUrl: z.string().optional(),
  peopleUsingProduct: z.enum(["yes", "no"]).optional(),
  haveRevenue: z.enum(["yes", "no"]).optional(),
  previousBatchChange: z.string().optional(),
  otherIncubator: z.string().optional(),
  whyThisIdea: z.string().optional(),
  competitors: z.string().optional(),
  howMakeMoney: z.string().optional(),
  category: z.string().optional(),
  otherIdeas: z.string().optional(),
  legalEntity: z.enum(["yes", "no"]).optional(),
  equityBreakdown: z.string().optional(),
  takenInvestment: z.enum(["yes", "no"]).optional(),
  currentlyFundraising: z.enum(["yes", "no"]).optional(),
  catholicMission: z.string().optional(),
  churchProblem: z.string().optional(),
  catholicTeachingAlignment: z.string().optional(),
  churchAudience: z.string().optional(),
  faithGrowth: z.string().optional(),
  whyApply: z.string().optional(),
  howHear: z.string().optional(),
  trackPreference: z.string().optional()
});

const saveDraftSchema = z.object({
  teamMembers: z.array(teamMemberSchema),
  sections: sectionsSchema
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing event slug" }, { status: 400 });
    }
    const registration = await getEventRegistrationByUser(slug, user.id);
    if (!registration) {
      return NextResponse.json({ error: "Not registered for this event. Register first." }, { status: 403 });
    }
    const application = await getEventApplicationByUser(slug, user.id);
    if (!application) return NextResponse.json(null);
    const teamMembers = await refreshEventApplicationTeamStatuses(application.teamMembers);
    return NextResponse.json({ ...application, teamMembers });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing event slug" }, { status: 400 });
    }
    const registration = await getEventRegistrationByUser(slug, user.id);
    if (!registration) {
      return NextResponse.json({ error: "Not registered for this event. Register first." }, { status: 403 });
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = saveDraftSchema.parse(body);
    const teamMembers: EventApplicationTeamMember[] = parsed.teamMembers.map((m) => ({
      email: m.email,
      userId: m.userId ?? null,
      status: m.status ?? "invited"
    }));
    const app = await upsertEventApplicationDraft({
      eventSlug: slug,
      userId: user.id,
      teamMembers,
      sections: parsed.sections
    });
    return NextResponse.json(app);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
