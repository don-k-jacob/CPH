import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import {
  addEventApplicationTeamMember,
  getEventApplicationForUser,
  getEventRegistrationByUser,
  removeEventApplicationTeamMember
} from "@/lib/firebase-db";

const addSchema = z.object({ email: z.string().email().transform((s) => s.trim().toLowerCase()) });

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
    const application = await getEventApplicationForUser(slug, user);
    const ownerId = application ? application.userId : user.id;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { email } = addSchema.parse(body);
    const result = await addEventApplicationTeamMember(slug, ownerId, email);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, member: result.member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}

export async function DELETE(
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
    const application = await getEventApplicationForUser(slug, user);
    const ownerId = application ? application.userId : user.id;
    const email = request.nextUrl.searchParams.get("email");
    if (!email?.trim()) {
      return NextResponse.json({ error: "Missing email query parameter" }, { status: 400 });
    }
    await removeEventApplicationTeamMember(slug, ownerId, email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
