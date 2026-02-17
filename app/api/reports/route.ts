import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createReport } from "@/lib/firebase-db";

const reportSchema = z.object({
  launchId: z.string().min(1),
  reason: z.enum(["SPAM", "ABUSE", "SCAM", "OTHER"]),
  details: z.string().max(1000).optional()
});

export async function POST(request: NextRequest) {
  try {
    const parsed = reportSchema.parse(await request.json());
    const reporterId = await getCurrentUserId();
    if (!reporterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = await createReport({
      launchId: parsed.launchId,
      reporterId,
      reason: parsed.reason,
      details: parsed.details
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to submit report" }, { status: 500 });
  }
}
