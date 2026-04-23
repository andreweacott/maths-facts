import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { topicId } = await params;
  const id = parseInt(topicId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 });

  // Verify topic belongs to user
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic || topic.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete messages first, then topic
  await prisma.message.deleteMany({ where: { topicId: id } });
  await prisma.topic.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
