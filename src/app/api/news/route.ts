import { NextResponse } from "next/server";
import { readCache } from "@/lib/agent/news-agent";

export const dynamic = "force-dynamic";

export async function GET() {
  const cache = readCache();
  return NextResponse.json(cache);
}
