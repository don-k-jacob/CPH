import { NextResponse } from "next/server";
import { getEventRegistrationsPage } from "@/lib/firebase-db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const cursor = searchParams.get("cursor");
  const parsedLimit = limitParam ? Number(limitParam) : 200;
  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return NextResponse.json({ error: "limit must be a positive number" }, { status: 400 });
  }

  try {
    const { rows, hasMore, nextCursor } = await getEventRegistrationsPage(slug, {
      limitCount: parsedLimit,
      cursor
    });
    const participants = rows.map((r) => ({
      userId: r.userId || r.id,
      userName: r.user?.name ?? r.userName ?? "",
      username: r.user?.username ?? r.userUsername ?? "",
      avatarUrl: r.user?.avatarUrl ?? r.userAvatarUrl ?? null,
      bio: r.user?.bio ?? r.userBio ?? null,
      participationType: r.participationType,
      teamName: r.teamName,
      projectName: r.projectName ?? "",
      skills: r.skills ?? [],
      teammatePreference: r.teammatePreference ?? null
    }));
    return NextResponse.json({ participants, hasMore, nextCursor });
  } catch (err) {
    console.error("[api] GET participants failed:", err);
    return NextResponse.json(
      { error: "Failed to load participants", participants: [] },
      { status: 500 }
    );
  }
}
