import { NextRequest, NextResponse } from "next/server";
import { buildParserUrl } from "@/lib/parser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  const useParser = searchParams.get("parser") !== "false";

  if (!url) {
    return NextResponse.json({ error: "缺少播放地址参数" }, { status: 400 });
  }

  try {
    const decoded = decodeURIComponent(url);

    if (useParser) {
      const parserUrl = buildParserUrl(decoded);
      return NextResponse.json({
        url: decoded,
        parserUrl,
        playUrl: parserUrl,
      });
    }

    return NextResponse.json({ url: decoded, playUrl: decoded });
  } catch {
    return NextResponse.json({ error: "无效的播放地址" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url as string;
    const useParser = body.parser !== false;

    if (!url) {
      return NextResponse.json({ error: "缺少播放地址" }, { status: 400 });
    }

    if (useParser) {
      const parserUrl = buildParserUrl(url);
      return NextResponse.json({ playUrl: parserUrl, parserUrl });
    }

    return NextResponse.json({ playUrl: url });
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
}
