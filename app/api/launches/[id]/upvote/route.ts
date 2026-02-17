import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getLaunchById, upvoteLaunch } from "@/lib/firebase-db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: launchId } = await params;

    if (!launchId) {
      return NextResponse.json({ error: "Invalid launch id" }, { status: 400 });
    }

    const launch = await getLaunchById(launchId);
    if (!launch) {
      return NextResponse.json({ error: "Launch not found" }, { status: 404 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const upvotes = await upvoteLaunch(launchId, userId);
    return NextResponse.json({ upvotes });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
