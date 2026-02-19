import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, updateEventRegistrationsUserSnapshot, updateUserProfile } from "@/lib/firebase-db";

const profileSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  experience: z.string().max(500).optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal(""))
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const parsed = profileSchema.parse(body);
    const username = parsed.username.toLowerCase();

    const conflict = await getUserByUsername(username);
    if (conflict && conflict.id !== user.id) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    await updateUserProfile(user.id, {
      name: parsed.name,
      username,
      bio: parsed.bio || null,
      avatarUrl: parsed.avatarUrl || null,
      experience: parsed.experience?.trim() || null,
      linkedInUrl: parsed.linkedInUrl?.trim() || null,
      xUrl: parsed.xUrl?.trim() || null,
      githubUrl: parsed.githubUrl?.trim() || null,
      websiteUrl: parsed.websiteUrl?.trim() || null
    });

    await updateEventRegistrationsUserSnapshot(user.id, {
      userName: parsed.name,
      userUsername: username,
      userAvatarUrl: parsed.avatarUrl || null,
      userBio: parsed.bio || null
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
