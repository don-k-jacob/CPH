import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { createComment, getLaunchById } from "@/lib/firebase-db";

const createCommentSchema = z.object({
  body: z.string().min(2).max(2000),
  parentId: z.string().optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: launchId } = await params;

    if (!launchId) {
      return NextResponse.json({ error: "Invalid launch id" }, { status: 400 });
    }

    const launch = await getLaunchById(launchId);
    if (!launch) {
      return NextResponse.json({ error: "Launch not found" }, { status: 404 });
    }

    const parsed = createCommentSchema.parse(await request.json());
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comment = await createComment({
      launchId,
      userId,
      body: parsed.body,
      parentId: parsed.parentId
    });

    return NextResponse.json({
      id: comment.id,
      body: comment.body,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            username: comment.user.username
          }
        : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
