import { NextResponse } from "next/server";
import { getCategories } from "@/lib/maotai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    const message = err instanceof Error ? err.message : "获取分类失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
