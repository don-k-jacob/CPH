import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { followUser } from "@/lib/firebase-db";

const followSchema = z.object({
  followeeId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const parsed = followSchema.parse(await request.json());
    const followerId = await getCurrentUserId();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (parsed.followeeId === followerId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const followers = await followUser(followerId, parsed.followeeId);
    return NextResponse.json({ followers });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to follow user" }, { status: 500 });
  }
}
