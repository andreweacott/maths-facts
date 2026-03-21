import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { rawInput } = await req.json();

  if (!rawInput?.trim()) {
    return NextResponse.json({ error: "Topic description required" }, { status: 400 });
  }

  // Use first line as title, fall back to first 40 chars
  const title = rawInput.split("\n")[0].trim().slice(0, 80) || rawInput.slice(0, 40);

  const topic = await prisma.topic.create({
    data: { userId: user.id, title, rawInput },
  });

  return NextResponse.json({ id: topic.id });
}
