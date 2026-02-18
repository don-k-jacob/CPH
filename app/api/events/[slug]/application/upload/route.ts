import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { getEventRegistrationByUser } from "@/lib/firebase-db";
import { getStorage } from "@/lib/firebase-admin";

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const CODING_EXT = new Set(["md", "txt"]);

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

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type"); // "founder-video" | "demo" | "coding-session"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const bucket = getStorage().bucket();
    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";
    let path: string;
    let maxBytes: number;

    if (type === "coding-session") {
      maxBytes = 10 * 1024 * 1024; // 10MB
      const extOk = CODING_EXT.has(extension) || file.type === "text/markdown" || file.type === "text/plain";
      if (!extOk && file.type !== "application/octet-stream") {
        return NextResponse.json({ error: "Coding session must be .md or .txt (max 10MB)" }, { status: 400 });
      }
      path = `event-apps/${slug}/${user.id}/coding-${Date.now()}-${randomUUID()}.${extension || "txt"}`;
    } else {
      // founder-video or demo: video, max 100MB
      maxBytes = 100 * 1024 * 1024;
      if (!VIDEO_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Video must be MP4, WebM, or QuickTime (max 100MB)" }, { status: 400 });
      }
      const folder = type === "founder-video" ? "founder-video" : "demo";
      path = `event-apps/${slug}/${user.id}/${folder}-${Date.now()}-${randomUUID()}.${extension || "mp4"}`;
    }

    if (file.size > maxBytes) {
      const maxMB = Math.round(maxBytes / (1024 * 1024));
      return NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(path);

    await blob.save(bytes, {
      resumable: false,
      contentType: file.type,
      metadata: { cacheControl: "public, max-age=31536000" }
    });

    const [signedUrl] = await blob.getSignedUrl({
      action: "read",
      expires: "2035-01-01"
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
