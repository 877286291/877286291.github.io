import { NextRequest, NextResponse } from "next/server";
import { getDetail } from "@/lib/maotai";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = parseInt(searchParams.get("id") || "", 10);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "无效的视频 ID" }, { status: 400 });
    }

    const detail = await getDetail(id);
    if (!detail) {
      return NextResponse.json({ error: "未找到该视频" }, { status: 404 });
    }

    return NextResponse.json({ detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取详情失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
