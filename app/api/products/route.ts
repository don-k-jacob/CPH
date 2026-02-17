import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createProductWithLaunch, findProductBySlug } from "@/lib/firebase-db";
import { slugify } from "@/lib/slugify";

const createProductSchema = z.object({
  name: z.string().min(2).max(40),
  tagline: z.string().min(8).max(60),
  description: z.string().min(20).max(500),
  websiteUrl: z.string().url(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  topicNames: z.array(z.string()).max(3).default([]),
  launchDate: z.string().datetime().optional(),
  media: z
    .array(
      z.object({
        type: z.enum(["IMAGE", "VIDEO"]),
        url: z.string().url()
      })
    )
    .default([])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.parse(body);
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseSlug = slugify(parsed.name);
    const existing = await findProductBySlug(baseSlug);
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug;

    const launchDateIso = parsed.launchDate ?? new Date().toISOString();
    const launchStatus = new Date(launchDateIso) > new Date() ? "SCHEDULED" : "LIVE";

    const created = await createProductWithLaunch({
      name: parsed.name,
      slug,
      tagline: parsed.tagline,
      description: parsed.description,
      websiteUrl: parsed.websiteUrl,
      logoUrl: parsed.logoUrl || null,
      makerId: userId,
      topicNames: parsed.topicNames,
      launchDate: launchDateIso,
      launchStatus,
      media: parsed.media
    });

    return NextResponse.json(
      { id: created.productId, slug, launchId: created.launchId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
