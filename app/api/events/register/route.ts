import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getUserById, upsertEventRegistration } from "@/lib/firebase-db";

const teammatePreferenceEnum = z.enum(["solo", "looking", "team"]);

const schema = z.object({
  eventSlug: z.string().min(2),
  teammatePreference: teammatePreferenceEnum,
  referralSource: z.string().min(1, "Please select how you heard about us."),
  eligibilityAgreed: z.literal(true, { errorMap: () => ({ message: "You must agree to the eligibility requirements." }) }),
  rulesAgreed: z.literal(true, { errorMap: () => ({ message: "You must agree to the Official Rules and Terms of Service." }) })
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Sign in to join the hackathon." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = schema.parse(body);

    const fullUser = await getUserById(user.id);
    const userSnapshot = fullUser
      ? {
          userName: fullUser.name,
          userUsername: fullUser.username,
          userAvatarUrl: fullUser.avatarUrl ?? null,
          userBio: fullUser.bio ?? null
        }
      : undefined;

    await upsertEventRegistration({
      eventSlug: parsed.eventSlug,
      userId: user.id,
      teammatePreference: parsed.teammatePreference,
      referralSource: parsed.referralSource,
      eligibilityAgreed: true,
      rulesAgreed: true,
      userSnapshot
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
