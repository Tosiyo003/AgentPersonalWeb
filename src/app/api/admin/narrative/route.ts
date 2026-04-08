import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const NARRATIVE_FILE = path.join(process.cwd(), "src", "data", "narrative.json");

interface NarrativeData {
  text: string;
}

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function readNarrative(): NarrativeData {
  try {
    const raw = fs.readFileSync(NARRATIVE_FILE, "utf-8");
    return JSON.parse(raw) as NarrativeData;
  } catch {
    return { text: "" };
  }
}

function writeNarrative(data: NarrativeData) {
  fs.writeFileSync(NARRATIVE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET: admin reads narrative
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(readNarrative());
}

// PUT: admin updates narrative
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "叙事主线内容不能为空" }, { status: 400 });
  }

  writeNarrative({ text });
  return NextResponse.json({ ok: true });
}
