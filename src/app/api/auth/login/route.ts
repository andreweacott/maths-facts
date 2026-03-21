import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, getSession, parseSettings } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const session = await getSession();
  session.user = {
    id: user.id,
    username: user.username,
    profileImagePath: user.profileImagePath,
    characterImagePath: user.characterImagePath,
    characterName: user.characterName,
    settings: parseSettings(user.settings),
  } as SessionUser;
  await session.save();

  return NextResponse.json({ ok: true });
}
