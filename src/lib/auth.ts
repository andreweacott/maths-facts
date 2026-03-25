import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionUser, UserSettings } from "@/types";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "maths-facts-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  return getIronSession<{ user?: SessionUser }>(await cookies(), sessionOptions);
}

export async function requireSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user ?? null;
}

export function parseSettings(raw: unknown): UserSettings {
  if (typeof raw !== "string") return {};
  try {
    return JSON.parse(raw) ?? {};
  } catch {
    return {};
  }
}
