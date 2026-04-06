import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readCache } from "@/lib/agent/news-agent";
import type { AgentNewsItem } from "@/lib/agent/types";

export const dynamic = "force-dynamic";

const CACHE_FILE = path.join(process.cwd(), "data", "news-cache.json");

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

// GET: full cache with metadata
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(readCache());
}

// PUT: update a single item
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { id, ...updates } = await req.json();
  const cache = readCache();
  const idx = cache.items.findIndex((it) => it.id === id);
  if (idx === -1) return NextResponse.json({ error: "未找到" }, { status: 404 });

  cache.items[idx] = { ...cache.items[idx], ...updates } as AgentNewsItem;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}

// DELETE: remove a single item
export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { id } = await req.json();
  const cache = readCache();
  cache.items = cache.items.filter((it) => it.id !== id);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
