import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ABOUT_FILE = path.join(process.cwd(), "data", "about.json");

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function readAbout() {
  try {
    return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf-8"));
  } catch {
    return { education: [], experience: [], journey: [] };
  }
}

function writeAbout(data: ReturnType<typeof readAbout>) {
  fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), "utf-8");
}

type Action =
  | "addEducation" | "updateEducation" | "deleteEducation"
  | "addExperience" | "updateExperience" | "deleteExperience"
  | "addJourney" | "updateJourney" | "deleteJourney";

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(readAbout());
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body as { action: Action };

  if (!action) {
    return NextResponse.json({ error: "缺少 action 参数" }, { status: 400 });
  }

  const about = readAbout();

  if (action === "addEducation" || action === "addExperience" || action === "addJourney") {
    const key = action === "addEducation" ? "education" : action === "addExperience" ? "experience" : "journey";
    const newItem = { ...body.data, id: crypto.randomUUID() };
    about[key] = [...about[key], newItem];
    writeAbout(about);
    return NextResponse.json({ ok: true, item: newItem });
  }

  if (action === "updateEducation" || action === "updateExperience" || action === "updateJourney") {
    const key = action === "updateEducation" ? "education" : action === "updateExperience" ? "experience" : "journey";
    const idx = about[key].findIndex((i: { id: string }) => i.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "条目不存在" }, { status: 404 });
    about[key][idx] = { ...about[key][idx], ...body.data };
    writeAbout(about);
    return NextResponse.json({ ok: true });
  }

  if (action === "deleteEducation" || action === "deleteExperience" || action === "deleteJourney") {
    const key = action === "deleteEducation" ? "education" : action === "deleteExperience" ? "experience" : "journey";
    about[key] = about[key].filter((i: { id: string }) => i.id !== body.id);
    writeAbout(about);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "未知 action" }, { status: 400 });
}
