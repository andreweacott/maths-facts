import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
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
    settings: JSON.parse(user.settings as string) ?? {},
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json(null, { status: 401 });
  const updates = await req.json(); // { profileImagePath? } | { characterImagePath? }
  await prisma.user.update({ where: { id: session.user.id }, data: updates });
  return NextResponse.json({ ok: true });
}
