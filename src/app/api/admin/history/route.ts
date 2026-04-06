import { NextRequest, NextResponse } from "next/server";
import { readHistory } from "@/lib/agent/news-agent";

export const dynamic = "force-dynamic";

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(readHistory());
}
