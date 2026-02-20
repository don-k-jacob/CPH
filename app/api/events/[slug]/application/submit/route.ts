import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getEventApplicationForUser, getEventRegistrationByUser, submitEventApplication } from "@/lib/firebase-db";

export async function POST(
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
    const application = await getEventApplicationForUser(slug, user);
    const ownerId = application ? application.userId : user.id;
    const result = await submitEventApplication(slug, ownerId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
