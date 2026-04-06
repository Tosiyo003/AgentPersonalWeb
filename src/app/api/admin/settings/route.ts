import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { enableChatWidget: true };
  }
}

async function writeSettings(data: Record<string, unknown>) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const settings = await readSettings();
  if (typeof body.enableChatWidget === "boolean") {
    settings.enableChatWidget = body.enableChatWidget;
    await writeSettings(settings);
  }
  return NextResponse.json(settings);
}
