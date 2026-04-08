import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Project } from "../../projects/route";

export const dynamic = "force-dynamic";

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json");

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function read(): { projects: Project[] } {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { projects: [] };
  }
}

function write(data: { projects: Project[] }) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  return NextResponse.json(read());
}

// POST: create project
export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();

  const newProject: Project = {
    id: crypto.randomUUID(),
    title: body.title?.trim() || "新项目",
    desc: body.desc?.trim() || "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    status: body.status || "计划中",
    statusColor: body.statusColor || "#8b5cf6",
    github: body.github?.trim() || "#",
    demo: body.demo?.trim() || null,
    highlight: false,
  };

  data.projects.push(newProject);
  write(data);
  return NextResponse.json({ ok: true, project: newProject });
}

// PUT: update project
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();
  const idx = data.projects.findIndex((p) => p.id === body.id);

  if (idx === -1) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  data.projects[idx] = {
    ...data.projects[idx],
    title: body.title ?? data.projects[idx].title,
    desc: body.desc ?? data.projects[idx].desc,
    tags: Array.isArray(body.tags) ? body.tags : data.projects[idx].tags,
    status: body.status ?? data.projects[idx].status,
    statusColor: body.statusColor ?? data.projects[idx].statusColor,
    github: body.github ?? data.projects[idx].github,
    demo: body.demo !== undefined ? body.demo : data.projects[idx].demo,
    highlight: body.highlight !== undefined ? body.highlight : data.projects[idx].highlight,
  };

  write(data);
  return NextResponse.json({ ok: true });
}

// DELETE
export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const data = read();
  const before = data.projects.length;
  data.projects = data.projects.filter((p) => p.id !== body.id);

  if (data.projects.length === before) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  write(data);
  return NextResponse.json({ ok: true });
}
