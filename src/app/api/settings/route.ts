import { NextRequest, NextResponse } from "next/server";
import { requireSession, parseSettings } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const updates = await req.json();
  // Whitelist allowed settings keys
  const allowed = ["chatBackground", "characterPanelBackground", "characterPosition"];
  const filtered: Record<string, string> = {};
  for (const key of allowed) {
    if (key in updates && typeof updates[key] === "string") {
      filtered[key] = updates[key];
    }
  }

  const current = await prisma.user.findUnique({ where: { id: user.id } });
  const currentSettings = parseSettings(current?.settings);
  const merged = { ...currentSettings, ...filtered };

  await prisma.user.update({
    where: { id: user.id },
    data: { settings: JSON.stringify(merged) },
  });
  return NextResponse.json({ ok: true });
}
