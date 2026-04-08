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

function readSettings(): Settings {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// Public: read settings (only safe fields exposed)
export async function GET(_req: NextRequest) {
  const settings = readSettings();
  return NextResponse.json({
    enableChatWidget: settings.enableChatWidget ?? true,
    bio: settings.bio ?? "",
    resumeUrl: settings.resumeUrl ?? null,
    agentContext: settings.agentContext ?? "",
    name: settings.name ?? "",
    title: settings.title ?? "",
    email: settings.email ?? "",
    github: settings.github ?? "",
  });
}
