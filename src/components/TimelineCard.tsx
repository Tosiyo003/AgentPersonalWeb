"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { TimelineItem, ProductItem } from "@/data/timeline";

/* Varying bottom gaps for staggered rhythm */
const bottomGaps = [40, 64, 44, 56, 36, 72, 48, 40, 60, 44];

interface Props {
  item: TimelineItem;
  index: number;
}

export default function TimelineCard({ item, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-72px" });
  const gap = bottomGaps[index % bottomGaps.length];

  return (
    <div
      ref={ref}
      id={`timeline-item-${index}`}
      className="scroll-mt-24 flex"
      style={{ paddingBottom: `${gap}px` }}
    >
      {/* ── Year column (sm+) ── */}
      <div className="hidden sm:flex w-28 shrink-0 justify-end pr-5 pt-3.5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.38, delay: index * 0.04 }}
        >
          <YearLabel year={item.year} color={item.color} isInView={isInView} />
        </motion.div>
      </div>

      {/* ── Dot ── */}
      <div className="shrink-0 w-8 flex flex-col items-center">
        <motion.div
          className="mt-3.5 relative z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 + 0.08, type: "spring", bounce: 0.45 }}
        >
          <div
            className="w-3 h-3 rounded-full border-2"
            style={{
              borderColor: item.color,
              background: `${item.color}22`,
              boxShadow: `0 0 8px ${item.color}55, 0 0 20px ${item.color}22`,
            }}
          />
        </motion.div>
      </div>

      {/* ── Card ── */}
      <motion.div
        className="flex-1 pl-4"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.42, delay: index * 0.04 + 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile year badge */}
        <div className="sm:hidden mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: `${item.color}18`,
              color: item.color,
              border: `1px solid ${item.color}30`,
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {item.year}
          </span>
        </div>

        <div
          className="glass overflow-hidden transition-all duration-300"
          style={expanded ? { borderColor: `${item.color}30`, boxShadow: `0 0 28px ${item.color}10, 0 8px 36px rgba(0,0,0,0.3)` } : {}}
        >
          {/* ═══ Main body: left concept | right products ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr]">

            {/* ── LEFT: concept ── */}
            <div
              className="p-5 flex flex-col gap-3"
              style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              {/* EN name + toggle */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="text-xs"
                    style={{ color: item.color, fontFamily: "var(--font-jetbrains)", opacity: 0.75 }}
                  >
                    {item.conceptEN}
                  </span>
                  <h3
                    className="text-lg font-bold leading-tight mt-0.5"
                    style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.9)" }}
                  >
                    {item.conceptCN}
                  </h3>
                </div>

                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-200"
                  style={{
                    background: expanded ? `${item.color}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${expanded ? item.color + "35" : "rgba(255,255,255,0.07)"}`,
                    color: expanded ? item.color : "rgba(255,255,255,0.3)",
                  }}
                  aria-expanded={expanded}
                  title={expanded ? "收起解释" : "展开解释"}
                >
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    animate={{ rotate: expanded ? 45 : 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </motion.svg>
                </button>
              </div>

              {/* One-liner */}
              <div
                className="p-3 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${item.color}0d 0%, rgba(139,92,246,0.05) 100%)`,
                  borderLeft: `2px solid ${item.color}`,
                }}
              >
                <span
                  className="block text-xs font-medium mb-1"
                  style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-jetbrains)" }}
                >
                  // 一句话本质
                </span>
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{
                    background: `linear-gradient(120deg, ${item.color} 0%, #a78bfa 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontFamily: "var(--font-noto-sc)",
                  }}
                >
                  {item.oneLiner}
                </p>
              </div>

              {/* Expand hint */}
              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="self-start flex items-center gap-1 text-xs transition-all duration-200 hover:gap-1.5"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  展开解释
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              )}

              {/* Tags (always visible) */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {item.tags.map((tag) => (
                  <span key={tag} className="tech-tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: products ── */}
            <div className="p-4 flex flex-col gap-0 sm:border-t-0 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p
                className="text-xs mb-3"
                style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-jetbrains)" }}
              >
                // 代表产品 & 落地方案
              </p>
              <div className="space-y-2.5">
                {item.products.map((p, pi) => (
                  <ProductRow key={pi} product={p} accentColor={item.color} />
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Expanded explanation (full width) ═══ */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="explanation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="px-5 py-4 space-y-2.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {item.explanation.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.52)" }}
                    >
                      {para}
                    </p>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={item.learnMoreUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:gap-2"
                      style={{ color: item.color }}
                    >
                      想深入了解
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                    <button
                      onClick={() => setExpanded(false)}
                      className="text-xs flex items-center gap-1"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      收起
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Product row ──────────────────────────────────────────── */
function ProductRow({ product }: { product: ProductItem; accentColor?: string }) {
  return (
    <a
      href={product.url ?? "#"}
      className="group block rounded-lg p-2.5 transition-all duration-200 no-underline"
      style={{ background: "rgba(255,255,255,0.025)" }}
      onClick={product.url === "#" ? (e) => e.preventDefault() : undefined}
    >
      <div className="flex items-center gap-2 mb-1">
        {/* Colored dot */}
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: product.badgeColor, boxShadow: `0 0 5px ${product.badgeColor}80` }}
        />
        {/* Product name */}
        <span
          className="text-sm font-semibold flex-1 truncate group-hover:text-white transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-space-grotesk)" }}
        >
          {product.name}
        </span>
        {/* Badge */}
        <span
          className="text-xs px-1.5 py-0.5 rounded shrink-0"
          style={{
            background: `${product.badgeColor}18`,
            color: product.badgeColor,
            border: `1px solid ${product.badgeColor}30`,
            fontFamily: "var(--font-jetbrains)",
            fontSize: "0.65rem",
          }}
        >
          {product.badge}
        </span>
      </div>
      <p
        className="text-xs leading-relaxed pl-3.5"
        style={{ color: "rgba(255,255,255,0.38)" }}
      >
        {product.desc}
      </p>
    </a>
  );
}

/* ─── Year label with typewriter reveal ────────────────────── */
function YearLabel({ year, color, isInView }: { year: string; color: string; isInView: boolean }) {
  return (
    <span
      className="text-lg font-bold leading-none tracking-tight whitespace-nowrap"
      style={{ fontFamily: "var(--font-jetbrains)", color }}
      aria-label={year}
    >
      {year.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 3 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
          transition={{ duration: 0.12, delay: i * 0.055 }}
          style={{ display: "inline-block" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
