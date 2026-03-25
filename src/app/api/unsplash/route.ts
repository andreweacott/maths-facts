import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { searchUnsplash } from "@/lib/unsplash";

export async function GET(req: NextRequest) {
  const user = await requireSession();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q") ?? "";
  const url = await searchUnsplash(query);
  return NextResponse.json({ url });
}
