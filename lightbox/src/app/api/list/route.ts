import { NextRequest, NextResponse } from "next/server";
import { getList } from "@/lib/maotai";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const typeId = searchParams.get("typeId");
    const typeIdNum = typeId ? parseInt(typeId, 10) : undefined;

    const result = await getList(page, typeIdNum);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取列表失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
