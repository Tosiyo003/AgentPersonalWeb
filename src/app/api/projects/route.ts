import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json");

export interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  status: string;
  statusColor: string;
  github: string;
  demo: string | null;
  highlight: boolean;
}

function readProjects(): { projects: Project[] } {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { projects: [] };
  }
}

export async function GET(_req: NextRequest) {
  return NextResponse.json(readProjects());
}
