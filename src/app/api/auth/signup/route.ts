import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getSession, parseSettings } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const { username, password, characterName, inviteCode } = await req.json();

  if (!process.env.INVITE_CODE) {
    return NextResponse.json({ error: "Server misconfiguration: INVITE_CODE not set" }, { status: 500 });
  }

  if (inviteCode !== process.env.INVITE_CODE) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  if (password.length < 6 || password.length > 72) {
    return NextResponse.json({ error: "Password must be 6–72 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, characterName: characterName || "Mathsie" },
  });

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
