import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { createTeammatePost, getTeammatePosts, updateTeammatePost } from "@/lib/firebase-db";

const postSchema = z.object({
  eventSlug: z.string().min(2),
  participationType: z.enum(["TEAM", "INDIVIDUAL"]),
  lookingFor: z.array(z.string().min(1)).min(1).max(10),
  message: z.string().min(10).max(700)
});

const patchSchema = z.object({
  postId: z.string().min(1),
  participationType: z.enum(["TEAM", "INDIVIDUAL"]),
  lookingFor: z.array(z.string().min(1)).min(1).max(10),
  message: z.string().min(10).max(700)
});

export async function GET(request: NextRequest) {
  try {
    const eventSlug = request.nextUrl.searchParams.get("eventSlug")?.trim();
    if (!eventSlug) {
      return NextResponse.json({ error: "eventSlug is required", data: [] }, { status: 400 });
    }

    const data = await getTeammatePosts(eventSlug);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error), data: [] }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = postSchema.parse(body);

    const created = await createTeammatePost({
      eventSlug: parsed.eventSlug,
      userId,
      participationType: parsed.participationType,
      lookingFor: parsed.lookingFor.map((v) => v.trim()).filter(Boolean),
      message: parsed.message.trim()
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = patchSchema.parse(body);

    const updated = await updateTeammatePost(parsed.postId, userId, {
      participationType: parsed.participationType,
      lookingFor: parsed.lookingFor.map((v) => v.trim()).filter(Boolean),
      message: parsed.message.trim()
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
