import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireSession } from "@/lib/auth";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif"];

export async function POST(req: NextRequest) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const field = form.get("field") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (field !== "profile" && field !== "character") {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const filename = `${user.id}-${field}-${Date.now()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ path: blob.url });
}
