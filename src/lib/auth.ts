import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

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
  cookieOptions: { secure: false },
};

export async function getSession() {
  return getIronSession<{ user?: SessionUser }>(await cookies(), sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.user) throw new Error("Not authenticated");
  return session.user;
}
