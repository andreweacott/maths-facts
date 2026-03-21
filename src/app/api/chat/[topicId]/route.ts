import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { chat } from "@/lib/claude";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { topicId: topicIdStr } = await params;
  const topicId = parseInt(topicIdStr);
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { topicId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ topic, messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { topicId: topicIdStr } = await params;
  const topicId = parseInt(topicIdStr);
  const topic = await prisma.topic.findFirst({ where: { id: topicId, userId: user.id } });
  if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { userMessage } = await req.json();

  if (userMessage) {
    await prisma.message.create({ data: { topicId, role: "user", content: userMessage } });
  }

  const history = await prisma.message.findMany({
    where: { topicId },
    orderBy: { createdAt: "asc" },
  });

  const assistantText = await chat(
    user.characterName,
    topic.rawInput,
    history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
  );

  await prisma.message.create({ data: { topicId, role: "assistant", content: assistantText } });

  return NextResponse.json({ content: assistantText });
}
