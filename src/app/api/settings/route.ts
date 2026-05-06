import { NextRequest, NextResponse } from "next/server";
import { getSession, parseSettings } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const updates = await req.json();
  // Whitelist allowed settings keys
  const allowed = ["chatBackground", "characterPanelBackground", "characterPosition", "theme", "font", "fontSize", "accentColor", "bubbleStyle", "myBubbleColor", "year"];
  const filtered: Record<string, string> = {};
  for (const key of allowed) {
    if (key in updates && typeof updates[key] === "string") {
      filtered[key] = updates[key];
    }
  }

  const current = await prisma.user.findUnique({ where: { id: session.user.id } });
  const currentSettings = parseSettings(current?.settings);
  const merged = { ...currentSettings, ...filtered };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { settings: JSON.stringify(merged) },
  });

  // Update session so server-rendered components (Header, etc) see the new value immediately
  session.user.settings = merged;
  await session.save();

  return NextResponse.json({ ok: true });
}
