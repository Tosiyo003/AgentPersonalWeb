import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ABOUT_FILE = path.join(process.cwd(), "data", "about.json");

function readAbout() {
  try {
    return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf-8"));
  } catch {
    return { education: [], experience: [], journey: [] };
  }
}

export async function GET() {
  return NextResponse.json(readAbout());
}
