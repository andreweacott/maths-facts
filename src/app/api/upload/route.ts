import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await requireSession();
  const form = await req.formData();
  const file = form.get("file") as File;
  const field = form.get("field") as string; // "profile" | "character"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const filename = `${user.id}-${field}-${Date.now()}.${ext}`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const imagePath = `/uploads/${filename}`;
  const updateData =
    field === "profile"
      ? { profileImagePath: imagePath }
      : { characterImagePath: imagePath };

  await prisma.user.update({ where: { id: user.id }, data: updateData });

  return NextResponse.json({ path: imagePath });
}
