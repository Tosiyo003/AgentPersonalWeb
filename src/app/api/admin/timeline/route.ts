import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TIMELINE_FILE = path.join(process.cwd(), "src", "data", "timeline.json");

export type GapSize = "near" | "medium" | "far";

export interface TimelineNode {
  id: string;
  year: string;
  nameEN: string;
  nameCN: string;
  oneLiner: string;
  explanation: string;
  learnMoreUrl: string;
  position: number;
  gap: GapSize;
  isFixed?: boolean;
  isTBC?: boolean;
}

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

function readTimeline(): TimelineNode[] {
  try {
    const raw = fs.readFileSync(TIMELINE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TimelineNode[]) : [];
  } catch {
    return [];
  }
}

function writeTimeline(nodes: TimelineNode[]) {
  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(nodes, null, 2), "utf-8");
}

function validateNode(node: unknown): node is TimelineNode {
  if (!node || typeof node !== "object") return false;
  const n = node as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.year === "string" &&
    typeof n.nameEN === "string" &&
    typeof n.nameCN === "string" &&
    typeof n.oneLiner === "string" &&
    typeof n.explanation === "string" &&
    typeof n.learnMoreUrl === "string" &&
    typeof n.position === "number" &&
    ["near", "medium", "far"].includes(n.gap as string)
  );
}

// ─── API handlers ─────────────────────────────────────────────────────────────

// GET
export async function GET(_req: NextRequest) {
  const nodes = readTimeline().sort((a, b) => a.position - b.position);
  return NextResponse.json({ items: nodes });
}

// POST: create new node — always appended at end (before TBC)
export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  if (!validateNode(body)) {
    return NextResponse.json({ error: "数据格式校验失败" }, { status: 400 });
  }

  const nodes = readTimeline();

  // Compute the position AFTER all existing non-TBC nodes (so it goes at the end before TBC)
  const maxNonTbcPos = nodes
    .filter((n) => !n.isTBC)
    .reduce((max, n) => Math.max(max, n.position), 0);

  const newNode: TimelineNode = {
    id: crypto.randomUUID(),
    year: body.year,
    nameEN: body.nameEN,
    nameCN: body.nameCN,
    oneLiner: body.oneLiner,
    explanation: body.explanation,
    learnMoreUrl: body.learnMoreUrl ?? "#",
    position: maxNonTbcPos + 1,
    gap: body.gap ?? "medium",
    isFixed: false,
    isTBC: false,
  };

  const updated = [...nodes, newNode];
  writeTimeline(compactPositions(updated));

  return NextResponse.json({ ok: true, node: newNode, position: newNode.position });
}

// PUT: update node — supports field edits and position moves
export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const nodes = readTimeline();
  const idx = nodes.findIndex((n) => n.id === body.id);

  if (idx === -1) {
    return NextResponse.json({ error: "未找到节点" }, { status: 404 });
  }

  const target = nodes[idx];

  // TBC: only year/gap changeable
  if (target.isTBC) {
    const updated = nodes.map((n) =>
      n.id === body.id ? { ...n, year: body.year ?? n.year, gap: body.gap ?? n.gap } : n
    );
    writeTimeline(updated);
    return NextResponse.json({ ok: true });
  }

  // Fixed start node: only year changeable
  if (target.isFixed) {
    const updated = nodes.map((n) =>
      n.id === body.id ? { ...n, year: body.year ?? n.year } : n
    );
    writeTimeline(updated);
    return NextResponse.json({ ok: true });
  }

  const newPos: number | undefined = typeof body.position === "number" ? body.position : undefined;
  const oldPos = target.position;

  let updated: TimelineNode[];

  if (newPos !== undefined && newPos !== oldPos) {
    // Move node to newPos: shift other nodes around
    updated = nodes.map((n) => {
      if (n.id === body.id) {
        return { ...n, ...body, position: newPos };
      }
      if (n.isTBC) return n;
      if (n.position === oldPos) return n; // already moved above
      if (oldPos < newPos) {
        // moving down (5→3): shift nodes in (old+1 ... newPos) up by 1
        if (n.position > oldPos && n.position <= newPos) return { ...n, position: n.position - 1 };
      } else {
        // moving up (3→5): shift nodes in (newPos ... old-1) down by 1
        if (n.position >= newPos && n.position < oldPos) return { ...n, position: n.position + 1 };
      }
      return n;
    });
  } else {
    // Field-only update (gap, year, nameCN, etc.)
    updated = nodes.map((n) => n.id === body.id ? { ...n, ...body } : n);
  }

  writeTimeline(updated);
  return NextResponse.json({ ok: true });
}

// DELETE
export async function DELETE(req: NextRequest) {
  if (!requireAuth(req)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await req.json();
  const nodes = readTimeline();

  const target = nodes.find((n) => n.id === id);
  if (target?.isFixed) {
    return NextResponse.json({ error: "固定节点不可删除" }, { status: 403 });
  }

  const filtered = nodes.filter((n) => n.id !== id);
  // Reassign sequential positions (compacts gaps left by deleted node)
  const reordered = compactPositions(filtered);
  writeTimeline(reordered);
  return NextResponse.json({ ok: true });
}

// ─── Helper: compact positions so non-TBC nodes are 1...N, TBC is last ────────
function compactPositions(nodes: TimelineNode[]): TimelineNode[] {
  const tbc = nodes.find((n) => n.isTBC);
  const rest = nodes.filter((n) => !n.isTBC).sort((a, b) => a.position - b.position);
  return [
    ...rest.map((n, i) => ({ ...n, position: i + 1 })),
    ...(tbc ? [{ ...tbc, position: rest.length + 1 }] : []),
  ];
}
