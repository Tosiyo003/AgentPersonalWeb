"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { zigzagNodes } from "@/data/timelineNodes";

// ─── SVG coordinate space ──────────────────────────────────────────────────
const W = 1000;
const H = 700;          // taller to fit 5 rows
const PAD = 80;
const USE_W = W - PAD * 2; // 840

// ─── Row y centres ────────────────────────────────────────────────────────
// Row 0 (LTR): y=90   — 2017–2022.9
// Row 1 (RTL): y=230  — 2023.0–2023.9
// Row 2 (LTR): y=370  — 2024.0–2025.0
// Row 3 (RTL): y=500  — 2025.1–2025.5
// Row 4 (LTR): y=620  — 2026–2026+
const R = [90, 230, 370, 500, 620] as const;

const NODE_POS: Array<{ x: number; y: number; above: boolean }> = [
  // Row 0  LTR  (2017→2022.9, span ≈ 5.9yr)
  { x: PAD + (0 / 5.9) * USE_W,   y: R[0], above: true  }, // 0  Transformer    2017
  { x: PAD + (1 / 5.9) * USE_W,   y: R[0], above: false }, // 1  BERT/GPT-1     2018
  { x: PAD + (3 / 5.9) * USE_W,   y: R[0], above: true  }, // 2  GPT-3/LLM      2020
  { x: PAD + (5.9 / 5.9) * USE_W, y: R[0], above: false }, // 3  ChatGPT        2022.9

  // Row 1  RTL  (2023.0→2023.9, span ≈ 0.9yr — tight, cluster right→left)
  { x: W - PAD - (0.0 / 0.9) * USE_W, y: R[1], above: true  }, // 4  Prompt Eng  2023.0
  { x: W - PAD - (0.4 / 0.9) * USE_W, y: R[1], above: false }, // 5  RAG         2023.4
  { x: W - PAD - (0.5 / 0.9) * USE_W, y: R[1], above: true  }, // 6  Embedding   2023.5
  { x: W - PAD - (0.9 / 0.9) * USE_W, y: R[1], above: false }, // 7  AI Agent    2023.9

  // Row 2  LTR  (2024.0→2025.0, span ≈ 1.0yr)
  { x: PAD + (0.0 / 1.0) * USE_W, y: R[2], above: true  }, // 8  Multimodal   2024.0
  { x: PAD + (0.5 / 1.0) * USE_W, y: R[2], above: false }, // 9  MCP          2024.5
  { x: PAD + (1.0 / 1.0) * USE_W, y: R[2], above: true  }, // 10 AI Skills    2025.0

  // Row 3  RTL  (2025.1→2025.5, very tight)
  { x: W - PAD - (0.05 / 0.5) * USE_W, y: R[3], above: false }, // 11 Vibe Coding 2025.1
  { x: W - PAD - (0.45 / 0.5) * USE_W, y: R[3], above: true  }, // 12 Agentic WF  2025.5

  // Row 4  LTR  (2026, spread loosely)
  { x: PAD + (0.0 / 1.0) * USE_W, y: R[4], above: true  }, // 13 Embodied AI  2026
  { x: PAD + (0.5 / 1.0) * USE_W, y: R[4], above: false }, // 14 Multi-Agent Society 2026
  { x: PAD + (1.0 / 1.0) * USE_W, y: R[4], above: true  }, // 15 ??? 2026+
];

// ─── Snake path ─────────────────────────────────────────────────────────
const EDGE_R = W - 28;
const EDGE_L = 28;
const n = NODE_POS;

const SNAKE = [
  `M ${n[0].x},${R[0]}`,
  `L ${n[1].x},${R[0]}`,
  `L ${n[2].x},${R[0]}`,
  `L ${n[3].x},${R[0]}`,
  `L ${EDGE_R},${R[0]}`,
  `C ${EDGE_R + 50},${R[0]} ${EDGE_R + 50},${R[1]} ${EDGE_R},${R[1]}`,
  `L ${n[4].x},${R[1]}`,
  `L ${n[5].x},${R[1]}`,
  `L ${n[6].x},${R[1]}`,
  `L ${n[7].x},${R[1]}`,
  `L ${EDGE_L},${R[1]}`,
  `C ${EDGE_L - 50},${R[1]} ${EDGE_L - 50},${R[2]} ${EDGE_L},${R[2]}`,
  `L ${n[8].x},${R[2]}`,
  `L ${n[9].x},${R[2]}`,
  `L ${n[10].x},${R[2]}`,
  `L ${EDGE_R},${R[2]}`,
  `C ${EDGE_R + 50},${R[2]} ${EDGE_R + 50},${R[3]} ${EDGE_R},${R[3]}`,
  `L ${n[11].x},${R[3]}`,
  `L ${n[12].x},${R[3]}`,
  `L ${EDGE_L},${R[3]}`,
  `C ${EDGE_L - 50},${R[3]} ${EDGE_L - 50},${R[4]} ${EDGE_L},${R[4]}`,
  `L ${n[13].x},${R[4]}`,
  `L ${n[14].x},${R[4]}`,
  `L ${n[15].x},${R[4]}`,
].join(" ");

const APPROX_PATH_LEN = 4800;

// ─── Color helpers ───────────────────────────────────────────────────────
const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6"];
const nodeColor = (i: number) => {
  if (i >= zigzagNodes.length - 1) return "#6366f1"; // ??? node special
  if (i >= zigzagNodes.length - 3) return "#a78bfa"; // 2026 nodes
  return COLORS[i % 3];
};
const isFuture = (i: number) => i >= zigzagNodes.length - 3; // last 3 are 2026+
const isTBC = (i: number) => i === zigzagNodes.length - 1;

// ─── Main export ─────────────────────────────────────────────────────────
export default function ZigzagTimeline() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const enter = (i: number) => setActiveIdx(i);
  const leave = () => setActiveIdx(null);
  const toggle = (i: number) => setActiveIdx((p) => (p === i ? null : i));

  return (
    <div className="w-full">
      <div className="hidden sm:block">
        <DesktopZigzag activeIdx={activeIdx} onEnter={enter} onLeave={leave} onClick={toggle} />
      </div>
      <div className="sm:hidden">
        <MobileList activeIdx={activeIdx} onToggle={toggle} />
      </div>
    </div>
  );
}

// ─── Desktop component ───────────────────────────────────────────────────
function DesktopZigzag({
  activeIdx,
  onEnter,
  onLeave,
  onClick,
}: {
  activeIdx: number | null;
  onEnter: (i: number) => void;
  onLeave: () => void;
  onClick: (i: number) => void;
}) {
  return (
    <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <div className="absolute inset-0" style={{ overflow: "visible" }}>

        {/* ── SVG path layer ── */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
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
            {/* Dashed future segment gradient */}
            <linearGradient id="futureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Base trail (solid portion up to node 12) */}
          <motion.path
            d={SNAKE}
            fill="none"
            stroke="rgba(59,130,246,0.13)"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.8, ease: "easeOut", delay: 0.2 }}
          />

          {/* Future dashed overlay on row 4 */}
          <motion.path
            d={`M ${EDGE_L},${R[4]} L ${n[13].x},${R[4]} L ${n[14].x},${R[4]} L ${n[15].x},${R[4]}`}
            fill="none"
            stroke="url(#futureGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3.2 }}
          />

          {/* Flowing electric highlight */}
          <motion.path
            d={SNAKE}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#zz-glow)"
            strokeDasharray={`65 ${APPROX_PATH_LEN}`}
            initial={{ opacity: 0, strokeDashoffset: 0 }}
            animate={{ opacity: 1, strokeDashoffset: [0, -(APPROX_PATH_LEN + 65)] }}
            transition={{
              opacity: { duration: 0.4, delay: 3.0 },
              strokeDashoffset: { duration: 6, ease: "linear", repeat: Infinity, delay: 3.0 },
            }}
          />

          {/* Active line glow */}
          {activeIdx !== null && (
            <motion.path
              d={SNAKE}
              fill="none"
              stroke={nodeColor(activeIdx)}
              strokeWidth="1.5"
              strokeOpacity={0.3}
              filter="url(#zz-glow-soft)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </svg>

        {/* ── Node overlays ── */}
        {zigzagNodes.map((node, i) => {
          if (!NODE_POS[i]) return null;
          const pos = NODE_POS[i];
          const color = nodeColor(i);
          const isActive = activeIdx === i;
          const tbc = isTBC(i);
          const future = isFuture(i);

          const leftPct = (pos.x / W) * 100;
          const topPct = (pos.y / H) * 100;
          // Popover direction: prefer left side if node is in right half, avoid edges
          const popoverRight = pos.x > W * 0.55;

          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isActive ? 60 : 20,
              }}
            >
              {/*
                ─ Hit area: wraps dot + label so hover on either triggers state.
                  We use a flex/block container that includes both the dot and
                  the absolutely-positioned label via padding/min-size.
              */}
              <div
                className="relative cursor-pointer"
                style={{
                  // Give the hit zone enough room to cover the label.
                  // Label sits ~28px above or below the dot, and can be ~80px wide.
                  // Padding creates the extended hit-area without affecting layout.
                  padding: pos.above
                    ? "48px 44px 8px 44px"   // label is above → pad top
                    : "8px 44px 48px 44px",  // label is below → pad bottom
                  margin: pos.above ? "-48px -44px -8px -44px" : "-8px -44px -48px -44px",
                }}
                onMouseEnter={() => onEnter(i)}
                onMouseLeave={onLeave}
                onClick={() => onClick(i)}
              >
                {/* ── Dot ── */}
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tbc && (
                    <span style={{ fontSize: "0.5rem", color, fontFamily: "var(--font-jetbrains)", lineHeight: 1 }}>
                      ?
                    </span>
                  )}
                </motion.div>

                {/* ── Label (above/below the dot, inside hit area) ── */}
                <motion.div
                  initial={{ opacity: 0, y: pos.above ? 5 : -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.055 + 0.7 }}
                  className="absolute text-center select-none"
                  style={{
                    ...(pos.above
                      ? { bottom: "calc(100% - 44px)" }
                      : { top: "calc(100% - 44px)" }),
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none", // events handled by parent
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
                    {node.yearLabel}
                  </div>
                  <div
                    className="font-semibold leading-tight mt-0.5 transition-colors duration-150"
                    style={{
                      fontSize: tbc ? "0.62rem" : "0.67rem",
                      color: isActive
                        ? "#fff"
                        : future
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.75)",
                      fontFamily: tbc ? "var(--font-jetbrains)" : "var(--font-space-grotesk)",
                      letterSpacing: tbc ? "0.08em" : undefined,
                    }}
                  >
                    {tbc ? "to be continued..." : node.nameCN}
                  </div>
                  {!tbc && (
                    <div
                      className="leading-none mt-px"
                      style={{
                        fontSize: "0.5rem",
                        color: "rgba(255,255,255,0.24)",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {node.nameEN}
                    </div>
                  )}
                </motion.div>

                {/* ── Popover ── */}
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
                        // Opaque background — no more see-through
                        background: "rgba(10, 11, 20, 0.96)",
                        backdropFilter: "blur(28px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(28px) saturate(1.4)",
                        border: `1px solid ${color}40`,
                        borderRadius: 14,
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 32px ${color}18, 0 12px 40px rgba(0,0,0,0.7)`,
                        ...(popoverRight
                          ? { right: "calc(100% + 16px)" }
                          : { left: "calc(100% + 16px)" }),
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 80,
                      }}
                      onMouseEnter={() => onEnter(i)}
                      onMouseLeave={onLeave}
                    >
                      {/* Arrow nub */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                        style={{
                          ...(popoverRight
                            ? {
                                right: -5,
                                background: "rgba(10, 11, 20, 0.96)",
                                borderTop: `1px solid ${color}40`,
                                borderRight: `1px solid ${color}40`,
                              }
                            : {
                                left: -5,
                                background: "rgba(10, 11, 20, 0.96)",
                                borderBottom: `1px solid ${color}40`,
                                borderLeft: `1px solid ${color}40`,
                              }),
                        }}
                      />

                      {/* Content */}
                      <div
                        className="text-xs mb-0.5"
                        style={{ color, fontFamily: "var(--font-jetbrains)", opacity: 0.75 }}
                      >
                        {node.yearLabel} · {node.nameEN}
                      </div>
                      <h3
                        className="text-sm font-bold mb-2 leading-snug"
                        style={{
                          fontFamily: "var(--font-space-grotesk)",
                          color: "rgba(255,255,255,0.94)",
                        }}
                      >
                        {tbc ? "下一个突破……" : node.nameCN}
                      </h3>
                      <p
                        className="text-xs leading-relaxed mb-3"
                        style={{ color: "rgba(255,255,255,0.56)" }}
                      >
                        {node.explanation}
                      </p>

                      {/* One-liner */}
                      <div
                        className="rounded-lg px-3 py-2 mb-3"
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}22`,
                          borderLeft: `2px solid ${color}`,
                        }}
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

                      {!tbc && (
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

        {/* ── "To be continued" trailing dots ── */}
        <motion.div
          className="absolute flex items-center gap-1.5"
          style={{
            left: `${((NODE_POS[15].x + 28) / W) * 100}%`,
            top: `${(R[4] / H) * 100}%`,
            transform: "translateY(-50%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          {[0, 1, 2].map((j) => (
            <motion.div
              key={j}
              className="rounded-full"
              style={{
                width: 4,
                height: 4,
                background: "#6366f1",
                boxShadow: "0 0 6px #6366f180",
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: j * 0.3 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Mobile list ────────────────────────────────────────────────────────────
function MobileList({
  activeIdx,
  onToggle,
}: {
  activeIdx: number | null;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="space-y-2 py-2">
      {zigzagNodes.map((node, i) => {
        const color = nodeColor(i);
        const isOpen = activeIdx === i;
        const tbc = isTBC(i);
        const future = isFuture(i);

        return (
          <motion.div
            key={i}
            className="overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderWidth: 1,
              borderStyle: tbc ? "dashed" : "solid",
              borderColor: isOpen ? color + "35" : "rgba(255,255,255,0.07)",
              borderRadius: 12,
              opacity: future && !isOpen ? 0.7 : 1,
              transition: "border-color 0.2s, opacity 0.2s",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: future && !isOpen ? 0.7 : 1, x: 0 }}
            transition={{ duration: 0.28, delay: i * 0.035 }}
          >
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => onToggle(i)}>
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
                    {node.yearLabel}
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
                    <div
                      className="rounded-lg px-3 py-2"
                      style={{ background: `${color}10`, borderLeft: `2px solid ${color}` }}
                    >
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

      {/* Trailing dots on mobile */}
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
