import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { storage } from "@/lib/firebase-admin";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const bucket = storage.bucket();
    const extension =
      (file.name.includes(".") ? file.name.split(".").pop() : file.type.split("/")[1]) || "bin";
    const path = `uploads/${userId}/${Date.now()}-${randomUUID()}.${extension}`;

    const bytes = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(path);

    await blob.save(bytes, {
      resumable: false,
      contentType: file.type,
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    });

    const [signedUrl] = await blob.getSignedUrl({
      action: "read",
      expires: "2035-01-01"
    });

    const kind = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

    return NextResponse.json({
      url: signedUrl,
      type: kind
    });
  } catch (error) {
    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
