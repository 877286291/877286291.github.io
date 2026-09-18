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

    const results = await searchVods(q);
    return NextResponse.json({ results, query: q });
  } catch (err) {
    const message = err instanceof Error ? err.message : "搜索失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
