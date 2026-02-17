import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { upsertEventRegistration } from "@/lib/firebase-db";

const schema = z.object({
  eventSlug: z.string().min(2),
  participationType: z.enum(["TEAM", "INDIVIDUAL"]),
  teamName: z.string().optional(),
  projectName: z.string().min(3).max(120),
  skills: z.array(z.string().min(1)).min(1).max(12),
  bio: z.string().min(10).max(600)
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = schema.parse(await request.json());

    if (parsed.participationType === "TEAM" && !parsed.teamName?.trim()) {
      return NextResponse.json({ error: "Team name is required for team registration." }, { status: 400 });
    }

    await upsertEventRegistration({
      eventSlug: parsed.eventSlug,
      userId,
      participationType: parsed.participationType,
      teamName: parsed.teamName?.trim() || null,
      projectName: parsed.projectName.trim(),
      skills: parsed.skills.map((s) => s.trim()).filter(Boolean),
      bio: parsed.bio.trim()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
