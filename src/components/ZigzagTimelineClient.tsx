"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimelineNode } from "@/lib/utils/timeline-path";

interface NodePos {
  x: number;
  y: number;
  above: boolean;
  node: TimelineNode;
  rowIdx: number;
  ratio: number;
}

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6"];
// SVG viewBox dimensions (ROW_START=50, ROW_END=750, width=700, so total ~800)
const SVG_W = 800;

function nodeColor(i: number, total: number): string {
  if (i >= total - 1) return "#6366f1"; // tbc
  if (i >= total - 3) return "#a78bfa"; // future (embodied/multi-agent)
  return COLORS[i % 3];
}
function isFuture(i: number, total: number) { return i >= total - 3; }
function isTBC(i: number, total: number) { return i === total - 1; }

// ─── Desktop SVG timeline ────────────────────────────────────────────────────
function DesktopTimeline({
  positions,
  snakePath,
  svgHeight,
  trailX,
  trailY,
}: {
  positions: NodePos[];
  snakePath: string;
  svgHeight: number;
  trailX: number;
  trailY: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = positions.length;
  const pathRef = useRef<SVGPathElement>(null);

  // Approximate path length for animation (rows * ~1400 px/row + bezier overhead)
  const approxPathLen = Math.max(2800, total * 200);

  const enter = (i: number) => setActiveIdx(i);
  const leave = () => setActiveIdx(null);
  const toggle = (i: number) => setActiveIdx((p) => (p === i ? null : i));

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(svgHeight / SVG_W) * 100}%` }}>
      <div className="absolute inset-0" style={{ overflow: "visible" }}>
        <svg
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        >
          <defs>
            <filter id="zz-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="zz-glow-soft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Blue-purple gradient for the flowing trail */}
            <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="futureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Base trail (dim) */}
          <motion.path
            ref={pathRef}
            d={snakePath}
            fill="none"
            stroke="rgba(59,130,246,0.1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />

          {/* Future dashed trailing segment */}
          <motion.path
            d={`M ${trailX - 28},${trailY} L ${trailX + 20},${trailY}`}
            fill="none"
            stroke="url(#futureGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3.2 }}
          />

          {/* Flowing electric highlight with gradient */}
          <motion.path
            d={snakePath}
            fill="none"
            stroke="url(#trailGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#zz-glow)"
            strokeDasharray={`51 ${approxPathLen}`}
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{
              strokeDashoffset: [0, -(approxPathLen + 51)],
              opacity: [0, 1, 1, 0.8],
            }}
            transition={{
              opacity: { duration: 0.4, delay: 3.0 },
              strokeDashoffset: { duration: 7, ease: "linear", repeat: Infinity, delay: 3.0 },
            }}
          />

          {/* Active node glow */}
          {activeIdx !== null && (
            <motion.path
              d={snakePath}
              fill="none"
              stroke={nodeColor(activeIdx, total)}
              strokeWidth="2"
              strokeOpacity={0.35}
              filter="url(#zz-glow-soft)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </svg>

        {/* ── Nodes ── */}
        {positions.map((pos, i) => {
          const { node, x, y, above } = pos;
          const color = nodeColor(i, total);
          const isActive = activeIdx === i;
          const tbc = isTBC(i, total);
          const future = isFuture(i, total);

          const leftPct = (x / SVG_W) * 100;
          const topPct = (y / svgHeight) * 100;
          const popoverRight = x > SVG_W * 0.55;

          return (
            <div
              key={node.id}
              className="absolute"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translate(-50%, -50%)", zIndex: isActive ? 60 : 20 }}
            >
              <div
                className="relative cursor-pointer"
                style={{
                  padding: above ? "48px 44px 8px 44px" : "8px 44px 48px 44px",
                  margin: above ? "-48px -44px -8px -44px" : "-8px -44px -48px -44px",
                }}
                onMouseEnter={() => enter(i)}
                onMouseLeave={leave}
                onClick={() => toggle(i)}
              >
                {/* Dot */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.6 : 1,
                    boxShadow: isActive
                      ? `0 0 0 4px ${color}22, 0 0 20px ${color}80, 0 0 40px ${color}30`
                      : tbc
                      ? `0 0 10px ${color}55`
                      : `0 0 7px ${color}40`,
                  }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="rounded-full border-2 mx-auto"
                  style={{
                    width: tbc ? 20 : 13,
                    height: tbc ? 20 : 13,
                    borderColor: color,
                    borderStyle: tbc ? "dashed" : "solid",
                    background: tbc ? `${color}15` : `${color}22`,
                  }}
                >
                  {tbc && (
                    <span style={{ fontSize: "0.5rem", color, fontFamily: "var(--font-jetbrains)", lineHeight: 1 }}>?</span>
                  )}
                </motion.div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, y: above ? 5 : -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.055 + 0.7 }}
                  className="absolute text-center select-none"
                  style={{
                    ...(above ? { bottom: "calc(100% - 44px)" } : { top: "calc(100% - 44px)" }),
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="font-bold leading-none"
                    style={{
                      fontSize: "0.58rem",
                      color: future ? "#a78bfa" : color,
                      fontFamily: "var(--font-jetbrains)",
                      opacity: future ? 0.7 : 1,
                    }}
                  >
                    {node.year}
                  </div>
                  <div
                    className="font-semibold leading-tight mt-0.5 transition-colors duration-150"
                    style={{
                      fontSize: tbc ? "0.62rem" : "0.67rem",
                      color: isActive ? "#fff" : future ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)",
                      fontFamily: tbc ? "var(--font-jetbrains)" : "var(--font-space-grotesk)",
                      letterSpacing: tbc ? "0.08em" : undefined,
                    }}
                  >
                    {tbc ? "to be continued..." : node.nameCN}
                  </div>
                  {!tbc && (
                    <div className="leading-none mt-px" style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.24)", fontFamily: "var(--font-jetbrains)" }}>
                      {node.nameEN}
                    </div>
                  )}
                </motion.div>

                {/* Popover */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.93, x: popoverRight ? 8 : -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.93 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute"
                      style={{
                        width: 276,
                        padding: "14px 16px",
                        background: "rgba(10, 11, 20, 0.96)",
                        backdropFilter: "blur(28px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(28px) saturate(1.4)",
                        border: `1px solid ${color}40`,
                        borderRadius: 14,
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 32px ${color}18, 0 12px 40px rgba(0,0,0,0.7)`,
                        ...(popoverRight ? { right: "calc(100% + 16px)" } : { left: "calc(100% + 16px)" }),
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 80,
                      }}
                      onMouseEnter={() => enter(i)}
                      onMouseLeave={leave}
                    >
                      {/* Arrow */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                        style={popoverRight
                          ? { right: -5, background: "rgba(10, 11, 20, 0.96)", borderTop: `1px solid ${color}40`, borderRight: `1px solid ${color}40` }
                          : { left: -5, background: "rgba(10, 11, 20, 0.96)", borderBottom: `1px solid ${color}40`, borderLeft: `1px solid ${color}40` }}
                      />

                      {/* Content */}
                      <div className="text-xs mb-0.5" style={{ color, fontFamily: "var(--font-jetbrains)", opacity: 0.75 }}>
                        {node.year} · {node.nameEN}
                      </div>
                      <h3 className="text-sm font-bold mb-2 leading-snug" style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.94)" }}>
                        {tbc ? "下一个突破……" : node.nameCN}
                      </h3>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.56)" }}>
                        {node.explanation}
                      </p>

                      {/* One-liner */}
                      <div
                        className="rounded-lg px-3 py-2 mb-3"
                        style={{ background: `${color}12`, border: `1px solid ${color}22`, borderLeft: `2px solid ${color}` }}
                      >
                        <p
                          className="text-xs font-semibold leading-snug"
                          style={{
                            background: `linear-gradient(120deg, ${color} 0%, #a78bfa 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontFamily: "var(--font-noto-sc)",
                          }}
                        >
                          {node.oneLiner}
                        </p>
                      </div>

                      {!tbc && node.learnMoreUrl && node.learnMoreUrl !== "#" && (
                        <a
                          href={node.learnMoreUrl}
                          className="inline-flex items-center gap-1 text-xs font-medium transition-all duration-150 hover:gap-2"
                          style={{ color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          深入了解
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Trailing dots */}
        <motion.div
          className="absolute flex items-center gap-1.5"
          style={{ left: `${(trailX / SVG_W) * 100}%`, top: `${(trailY / svgHeight) * 100}%`, transform: "translateY(-50%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          {[0, 1, 2].map((j) => (
            <motion.div
              key={j}
              className="rounded-full"
              style={{ width: 4, height: 4, background: "#6366f1", boxShadow: "0 0 6px #6366f180" }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: j * 0.3 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Mobile accordion list ────────────────────────────────────────────────────
function MobileList({
  positions,
  svgHeight,
}: {
  positions: NodePos[];
  svgHeight: number;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = positions.length;

  return (
    <div className="space-y-2 py-2">
      {positions.map((pos, i) => {
        const { node } = pos;
        const color = nodeColor(i, total);
        const isOpen = activeIdx === i;
        const tbc = isTBC(i, total);
        const future = isFuture(i, total);

        return (
          <motion.div
            key={node.id}
            className="overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderWidth: 1,
              borderStyle: tbc ? "dashed" : "solid",
              borderColor: isOpen ? `${color}35` : "rgba(255,255,255,0.07)",
              borderRadius: 12,
              opacity: future && !isOpen ? 0.7 : 1,
              transition: "border-color 0.2s, opacity 0.2s",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: future && !isOpen ? 0.7 : 1, x: 0 }}
            transition={{ duration: 0.28, delay: i * 0.035 }}
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => setActiveIdx((p) => (p === i ? null : i))}
            >
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: tbc ? 10 : 8,
                  height: tbc ? 10 : 8,
                  background: color,
                  boxShadow: `0 0 6px ${color}60`,
                  border: tbc ? `1px dashed ${color}` : "none",
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs shrink-0"
                    style={{ color, fontFamily: "var(--font-jetbrains)", opacity: future ? 0.7 : 1 }}
                  >
                    {node.year}
                  </span>
                  <span
                    className="text-sm font-semibold truncate"
                    style={{
                      fontFamily: tbc ? "var(--font-jetbrains)" : "var(--font-space-grotesk)",
                      color: future ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.85)",
                      letterSpacing: tbc ? "0.06em" : undefined,
                      fontSize: tbc ? "0.7rem" : undefined,
                    }}
                  >
                    {tbc ? "to be continued..." : node.nameCN}
                  </span>
                </div>
                {!isOpen && !tbc && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.32)" }}>
                    {node.oneLiner}
                  </p>
                )}
              </div>
              {!tbc && (
                <motion.svg
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }}
                >
                  <path d="M6 9l6 6 6-6" />
                </motion.svg>
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && !tbc && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm leading-relaxed pt-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {node.explanation}
                    </p>
                    <div className="rounded-lg px-3 py-2" style={{ background: `${color}10`, borderLeft: `2px solid ${color}` }}>
                      <p
                        className="text-xs font-semibold"
                        style={{
                          background: `linear-gradient(120deg, ${color} 0%, #a78bfa 100%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {node.oneLiner}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {isOpen && tbc && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm leading-relaxed pt-3" style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                      {node.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Trailing dots */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {[0, 1, 2].map((j) => (
          <motion.div
            key={j}
            className="rounded-full"
            style={{ width: 5, height: 5, background: "#6366f1" }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: j * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ZigzagTimelineClient({
  positions,
  snakePath,
  svgHeight,
  trailX,
  trailY,
}: {
  positions: NodePos[];
  snakePath: string;
  svgHeight: number;
  trailX: number;
  trailY: number;
}) {
  return (
    <div className="w-full">
      <div className="hidden sm:block">
        <DesktopTimeline positions={positions} snakePath={snakePath} svgHeight={svgHeight} trailX={trailX} trailY={trailY} />
      </div>
      <div className="sm:hidden">
        <MobileList positions={positions} svgHeight={svgHeight} />
      </div>
    </div>
  );
}
