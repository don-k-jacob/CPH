import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getNotificationsForUser } from "@/lib/firebase-db";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getNotificationsForUser(userId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error), data: [] }, { status: 503 });
  }
}
