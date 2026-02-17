import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/firebase-db";
import { getSessionUserId } from "@/lib/session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, stored] = hash.split(":");
  if (!salt || !stored) return false;

  const derived = scryptSync(password, salt, 64).toString("hex");
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(Buffer.from(stored, "hex"), Buffer.from(derived, "hex"));
}

export async function getCurrentUser() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return null;

    return getUserById(userId);
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
