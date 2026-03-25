import { NextRequest, NextResponse } from "next/server";
import { getSession, parseSettings } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json(null, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json(null, { status: 404 });
  return NextResponse.json({
    id: user.id,
    username: user.username,
    profileImagePath: user.profileImagePath,
    characterImagePath: user.characterImagePath,
    characterName: user.characterName,
    settings: parseSettings(user.settings),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json(null, { status: 401 });
  const body = await req.json();
  const { profileImagePath, characterImagePath } = body as {
    profileImagePath?: string;
    characterImagePath?: string;
  };
  const data: Record<string, string> = {};
  if (typeof profileImagePath === "string") data.profileImagePath = profileImagePath;
  if (typeof characterImagePath === "string") data.characterImagePath = characterImagePath;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: session.user.id }, data });
  // Update session so server components (e.g. Header) see the change
  if (data.profileImagePath !== undefined) session.user.profileImagePath = data.profileImagePath;
  if (data.characterImagePath !== undefined) session.user.characterImagePath = data.characterImagePath;
  await session.save();
  return NextResponse.json({ ok: true });
}
