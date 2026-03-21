import { NextRequest, NextResponse } from "next/server";
import { searchUnsplash } from "@/lib/unsplash";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const url = await searchUnsplash(query);
  return NextResponse.json({ url });
}
