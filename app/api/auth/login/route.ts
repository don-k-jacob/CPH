import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/auth";
import { getUserByEmail } from "@/lib/firebase-db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.parse(await request.json());
    const user = await getUserByEmail(parsed.email.toLowerCase());

    if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ id: user.id, username: user.username });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to log in" }, { status: 500 });
  }
}
