import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, updateUserProfile } from "@/lib/firebase-db";

const profileSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = profileSchema.parse(await request.json());
    const username = parsed.username.toLowerCase();

    const conflict = await getUserByUsername(username);
    if (conflict && conflict.id !== user.id) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    await updateUserProfile(user.id, {
      name: parsed.name,
      username,
      bio: parsed.bio || null,
      avatarUrl: parsed.avatarUrl || null
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
