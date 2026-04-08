import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const NARRATIVE_FILE = path.join(process.cwd(), "src", "data", "narrative.json");

interface NarrativeData {
  text: string;
}

function readNarrative(): NarrativeData {
  try {
    const raw = fs.readFileSync(NARRATIVE_FILE, "utf-8");
    return JSON.parse(raw) as NarrativeData;
  } catch {
    return { text: "" };
  }
}

// GET: public endpoint for homepage
export async function GET(_req: NextRequest) {
  const data = readNarrative();
  return NextResponse.json(data);
}
