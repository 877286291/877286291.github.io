import { NextRequest, NextResponse } from "next/server";
import { searchVods } from "@/lib/maotai";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({ error: "请输入搜索关键词" }, { status: 400 });
    }

    const startPage = Math.max(1, parseInt(searchParams.get("startPage") || "1", 10));
    const maxPages = Math.min(50, parseInt(searchParams.get("maxPages") || "15", 10));

    const { results, scannedFrom, scannedTo, hasMore } = await searchVods(q, {
      startPage,
      maxPages,
    });
    return NextResponse.json({
      results,
      query: q,
      scannedFrom,
      scannedTo,
      hasMore,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "搜索失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
