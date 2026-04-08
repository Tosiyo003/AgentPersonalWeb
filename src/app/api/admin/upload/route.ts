import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

interface Settings {
  enableChatWidget?: boolean;
  bio?: string;
  resumeUrl?: string;
  agentContext?: string;
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

// POST: upload a new resume PDF
export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  let filename: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未找到上传文件" }, { status: 400 });
    }

    // Validate PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "仅支持 PDF 格式文件" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 });
    }

    // Ensure upload dir exists
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    // Delete old resume if exists
    const settings = readSettings();
    if (settings.resumeUrl) {
      const oldPath = path.join(process.cwd(), "public", settings.resumeUrl.replace(/^\//, ""));
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log(`[upload] Deleted old resume: ${oldPath}`);
        }
      } catch (e) {
        console.warn("[upload] Failed to delete old resume:", e);
      }
    }

    // Save new file
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    filename = `/uploads/${Date.now()}_${safeName}`;
    const filePath = path.join(process.cwd(), "public", filename.replace(/^\//, ""));
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Update settings with new resumeUrl
    settings.resumeUrl = filename;
    writeSettings(settings);

    console.log(`[upload] Saved resume: ${filename} (${file.size} bytes)`);
    return NextResponse.json({ ok: true, resumeUrl: filename });
  } catch (err) {
    console.error("[upload] Error:", err);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

// DELETE: delete current resume PDF
export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const settings = readSettings();
  if (!settings.resumeUrl) {
    return NextResponse.json({ error: "没有已上传的简历" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", settings.resumeUrl.replace(/^\//, ""));
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[upload] Deleted resume: ${filePath}`);
    }
  } catch (e) {
    console.warn("[upload] Failed to delete resume:", e);
  }

  settings.resumeUrl = undefined;
  writeSettings(settings);

  return NextResponse.json({ ok: true });
}
