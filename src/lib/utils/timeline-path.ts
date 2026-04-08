/**
 * Timeline Path Generator
 *
 * Uses a position+gap model:
 * - `position`: 1-based index in the timeline
 * - `gap`: "near" | "medium" | "far" (distance from previous node)
 * - `distance`: computed cumulatively from position and gaps
 *   (start=0, then each node adds GAP_DIST[gap])
 *
 * Row structure:
 * - Row width: 700px (x: 50 → 750)
 * - Alternating LTR / RTL direction
 * - ~4 nodes per row; rows auto-extend as cumulative distance grows
 * - Smooth bezier corners at each row-end
 */

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

export interface NodePos {
  x: number;
  y: number;
  above: boolean;
  node: TimelineNode;
  rowIdx: number;
  distance: number;
  ratio: number;
}

// ─── Layout constants ──────────────────────────────────────────────────────────
const ROW_WIDTH = 700;   // horizontal span per row
const ROW_START = 50;    // left edge of usable area
const ROW_END   = ROW_START + ROW_WIDTH; // 750
const VERT_STEP = 130;   // vertical spacing between rows
const ROW_Y0    = 90;    // y-center of first row
const BDX       = 70;    // bezier control-point horizontal offset (bulge depth)

// Gap → pixel distance
const GAP_DIST: Record<GapSize, number> = {
  near:   100,
  medium: 180,
  far:    280,
};

// ─── Derive distance from position + gap ────────────────────────────────────
function withDistance(nodes: TimelineNode[]): (TimelineNode & { distance: number })[] {
  const sorted = [...nodes].sort((a, b) => a.position - b.position);
  let cumulative = 0;
  return sorted.map((n) => {
    if (n.position === 1) {
      cumulative = 0; // start node always at 0
      return { ...n, distance: 0 };
    }
    const d = cumulative;
    if (!n.isTBC) {
      cumulative += GAP_DIST[n.gap];
    }
    return { ...n, distance: d };
  });
}

// ─── Build row segments ───────────────────────────────────────────────────────
interface RowSegment {
  rowIdx: number;
  direction: "LTR" | "RTL";
  nodes: (TimelineNode & { distance: number })[];
  startDist: number;
  endDist: number;
  y: number;
}

function buildSegments(
  sorted: (TimelineNode & { distance: number })[]
): RowSegment[] {
  if (sorted.length === 0) return [];

  const segments: RowSegment[] = [];
  let curDir: "LTR" | "RTL" = "LTR";
  let curY = ROW_Y0;
  let rowStartDist = sorted[0].distance;
  let rowNodes: (TimelineNode & { distance: number })[] = [];

  for (const node of sorted) {
    const distInRow = node.distance - rowStartDist;
    const fits = distInRow < ROW_WIDTH;

    if (!fits && rowNodes.length > 0) {
      // Finalize current segment
      const lastDist = rowNodes[rowNodes.length - 1].distance;
      segments.push({
        rowIdx: segments.length,
        direction: curDir,
        nodes: [...rowNodes],
        startDist: rowStartDist,
        endDist: lastDist,
        y: curY,
      });

      // Start new segment
      curDir = curDir === "LTR" ? "RTL" : "LTR";
      curY += VERT_STEP;
      rowStartDist = node.distance;
      rowNodes = [node];
    } else {
      rowNodes.push(node);
    }
  }

  if (rowNodes.length > 0) {
    const lastDist = rowNodes[rowNodes.length - 1].distance;
    segments.push({
      rowIdx: segments.length,
      direction: curDir,
      nodes: [...rowNodes],
      startDist: rowStartDist,
      endDist: lastDist,
      y: curY,
    });
  }

  return segments;
}

// ─── Compute 2D positions ────────────────────────────────────────────────────
function computePositions(
  sorted: (TimelineNode & { distance: number })[]
): { positions: NodePos[]; totalDistance: number } {
  if (sorted.length === 0) return { positions: [], totalDistance: 0 };

  const totalDistance = sorted[sorted.length - 1].distance;
  const segments = buildSegments(sorted);
  const positions: NodePos[] = [];

  for (const seg of segments) {
    const rowSpan = seg.endDist - seg.startDist;

    seg.nodes.forEach((node, idx) => {
      const distInRow = node.distance - seg.startDist;
      const ratio = rowSpan > 0 ? distInRow / rowSpan : 0.5;

      const EDGE_PAD = 0.05;
      const usable = 1 - 2 * EDGE_PAD;
      let x: number;
      if (seg.direction === "LTR") {
        x = ROW_START + EDGE_PAD * ROW_WIDTH + ratio * usable * ROW_WIDTH;
      } else {
        x = ROW_END - EDGE_PAD * ROW_WIDTH - ratio * usable * ROW_WIDTH;
      }
      x = Math.max(ROW_START + 10, Math.min(ROW_END - 10, x));

      const above = idx % 2 === 0;

      positions.push({
        x,
        y: seg.y,
        above,
        node,
        rowIdx: seg.rowIdx,
        distance: node.distance,
        ratio: totalDistance > 0 ? node.distance / totalDistance : 0,
      });
    });
  }

  return { positions, totalDistance };
}

// ─── Build SVG path ───────────────────────────────────────────────────────────
function positionsForNode(
  sorted: (TimelineNode & { distance: number })[],
  segments: RowSegment[],
  targetId: string
): { x: number; y: number } {
  const { positions } = computePositions(sorted);
  const pos = positions.find((p) => p.node.id === targetId);
  return pos ? { x: pos.x, y: pos.y } : { x: ROW_START + ROW_WIDTH / 2, y: ROW_Y0 };
}

function buildSvgPath(sorted: (TimelineNode & { distance: number })[]): string {
  if (sorted.length === 0) return "";
  if (sorted.length === 1) {
    return `M ${ROW_START + ROW_WIDTH / 2},${ROW_Y0}`;
  }

  const segments = buildSegments(sorted);
  const parts: string[] = [];

  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const firstNode = seg.nodes[0];
    const lastNode = seg.nodes[seg.nodes.length - 1];

    if (si === 0) {
      const p = positionsForNode(sorted, segments, firstNode.id);
      parts.push(`M ${p.x},${seg.y}`);
    }

    const lp = positionsForNode(sorted, segments, lastNode.id);
    parts.push(`L ${lp.x},${seg.y}`);

    if (si < segments.length - 1) {
      const nextSeg = segments[si + 1];
      const cornerX = seg.direction === "LTR" ? ROW_END : ROW_START;
      const bulgedCX = seg.direction === "LTR" ? cornerX + BDX : cornerX - BDX;

      parts.push(`C ${bulgedCX},${seg.y} ${bulgedCX},${nextSeg.y} ${cornerX},${nextSeg.y}`);

      const np = positionsForNode(sorted, segments, nextSeg.nodes[0].id);
      parts.push(`L ${np.x},${nextSeg.y}`);
    }
  }

  return parts.join(" ");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeNodePositions(nodes: TimelineNode[]): NodePos[] {
  const withDist = withDistance(nodes);
  const { positions } = computePositions(withDist);
  return positions;
}

export function buildRailPath(nodes: TimelineNode[]): {
  path: string;
  totalDistance: number;
  svgHeight: number;
} {
  if (nodes.length === 0) return { path: "", totalDistance: 0, svgHeight: 300 };

  const withDist = withDistance(nodes).sort((a, b) => a.distance - b.distance);
  const path = buildSvgPath(withDist);
  const totalDistance = withDist[withDist.length - 1].distance;

  const segments = buildSegments(withDist);
  const lastSeg = segments[segments.length - 1];
  const svgHeight = Math.max(700, lastSeg.y + 200);

  return { path, totalDistance, svgHeight };
}

export function getPointAtRatio(
  pathEl: SVGPathElement,
  ratio: number
): { x: number; y: number } {
  try {
    const len = pathEl.getTotalLength();
    const pt = pathEl.getPointAtLength(len * Math.max(0, Math.min(1, ratio)));
    return { x: pt.x, y: pt.y };
  } catch {
    return { x: ROW_START + ROW_WIDTH / 2, y: ROW_Y0 };
  }
}
