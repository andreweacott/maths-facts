import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];

export async function POST(req: NextRequest) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const field = form.get("field") as string; // "profile" | "character"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Validate field
  if (field !== "profile" && field !== "character") {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  // Validate file extension (allowlist images only)
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Size limit: 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

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
