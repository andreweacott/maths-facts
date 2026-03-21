import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import type { SessionUser } from "@/types";

export async function POST(req: NextRequest) {
  const { username, password, characterName } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
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
    settings: JSON.parse(user.settings as string) ?? {},
  } as SessionUser;
  await session.save();

  return NextResponse.json({ ok: true });
}
