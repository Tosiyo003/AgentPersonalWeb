import fs from "fs";
import path from "path";
import ZigzagTimelineClient from "./ZigzagTimelineClient";
import { buildRailPath, computeNodePositions, type TimelineNode } from "@/lib/utils/timeline-path";

export type { TimelineNode };

const TIMELINE_FILE = path.join(process.cwd(), "src", "data", "timeline.json");

function readTimeline(): TimelineNode[] {
  try {
    const raw = fs.readFileSync(TIMELINE_FILE, "utf-8");
    return JSON.parse(raw) as TimelineNode[];
  } catch {
    return [];
  }
}

export default function ZigzagTimeline() {
  const nodes = readTimeline();

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
        暂无时间线数据
      </div>
    );
  }

  // Sort by position ascending (distance is computed inside the path module)
  const sorted = [...nodes].sort((a, b) => a.position - b.position);
  const positions = computeNodePositions(sorted);
  const { path: snakePath, totalDistance, svgHeight } = buildRailPath(sorted);

  const lastPos = positions[positions.length - 1];
  const trailX = lastPos.x + 40;
  const trailY = lastPos.y;

  return (
    <ZigzagTimelineClient
      positions={positions}
      snakePath={snakePath}
      svgHeight={svgHeight}
      trailX={trailX}
      trailY={trailY}
    />
  );
}
