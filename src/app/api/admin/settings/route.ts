import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

interface Settings {
  enableChatWidget?: boolean;
  bio?: string;
  resumeUrl?: string;
  agentContext?: string;
  name?: string;
  title?: string;
  email?: string;
  github?: string;
}

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function readSettings(): Settings {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeSettings(data: Settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET: full settings (admin only)
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(readSettings());
}

// PUT: update settings fields
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const settings = readSettings();

  if (typeof body.enableChatWidget === "boolean") {
    settings.enableChatWidget = body.enableChatWidget;
  }
  if (typeof body.bio === "string") {
    settings.bio = body.bio.trim();
  }
  if (typeof body.agentContext === "string") {
    settings.agentContext = body.agentContext.trim();
  }
  if (typeof body.name === "string") {
    settings.name = body.name.trim();
  }
  if (typeof body.title === "string") {
    settings.title = body.title.trim();
  }
  if (typeof body.email === "string") {
    settings.email = body.email.trim();
  }
  if (typeof body.github === "string") {
    settings.github = body.github.trim();
  }
  // resumeUrl is managed by the upload API — reject attempts to set it via PUT
  // (prevents spoofing a resume URL without actually uploading)

  writeSettings(settings);
  return NextResponse.json({ ok: true });
}
