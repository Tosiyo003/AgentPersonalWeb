import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const RESOURCES_FILE = path.join(process.cwd(), "data", "resources.json");

export interface ResourceItem {
  id: string;
  name: string;
  desc: string;
  type: string;
  url: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: ResourceItem[];
}

function readResources(): { categories: Category[] } {
  try {
    const raw = fs.readFileSync(RESOURCES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { categories: [] };
  }
}

export async function GET(_req: NextRequest) {
  return NextResponse.json(readResources());
}
