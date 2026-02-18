import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { getBackendErrorMessage } from "@/lib/backend-error";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/firebase-db";
import { setSessionCookie } from "@/lib/session";

const signupSchema = z.object({
  name: z.string().trim().min(2),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export async function POST(request: NextRequest) {
  try {
    const parsed = signupSchema.parse(await request.json());
    const email = parsed.email.toLowerCase();
    const username = parsed.username.toLowerCase();

    const [existingEmail, existingUsername] = await Promise.all([getUserByEmail(email), getUserByUsername(username)]);
    if (existingEmail || existingUsername) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 409 });
    }

    const user = await createUser({
      name: parsed.name,
      email,
      username,
      passwordHash: hashPassword(parsed.password)
    });

    const response = NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: getBackendErrorMessage(error) }, { status: 503 });
  }
}
