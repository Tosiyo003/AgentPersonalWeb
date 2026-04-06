"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentNewsItem } from "@/lib/agent/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  return `${Math.floor(hrs / 24)} 天前`;
}

const TAG_COLORS: Record<string, string> = {
  Claude: "#d97706",
  Anthropic: "#d97706",
  OpenAI: "#10a37f",
  Gemini: "#4285f4",
  Google: "#4285f4",
  MCP: "#3b82f6",
  "Vibe Coding": "#8b5cf6",
  DeepSeek: "#8b5cf6",
  开源LLM: "#06b6d4",
  "Twitter / X": "#1d9bf0",
  "Hacker News": "#f97316",
  "B 站": "#00a1d6",
  微博: "#e6162d",
  "AI Agent": "#f59e0b",
  大模型: "#6366f1",
  LLM: "#6366f1",
};
const DEFAULT_TAG_COLOR = "#6366f1";

interface CacheData {
  items: AgentNewsItem[];
  generatedAt: string | null;
  runId: string | null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NewsSection() {
  const [cache, setCache] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: CacheData) => setCache(data))
      .catch(() => setCache({ items: [], generatedAt: null, runId: null }))
      .finally(() => setLoading(false));
  }, []);

  const hasNews = (cache?.items?.length ?? 0) > 0;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold gradient-text-blue section-title">
              AI 热点速递
            </h2>
            {/* Live / Empty badge */}
            <span
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
              style={
                hasNews
                  ? {
                      background: "rgba(16,163,127,0.12)",
                      border: "1px solid rgba(16,163,127,0.3)",
                      color: "#34d399",
                      fontFamily: "var(--font-jetbrains)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-jetbrains)",
                    }
              }
            >
              {hasNews ? (
                <>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
                    style={{ animation: "pulse 1.5s ease infinite" }}
                  />
                  实时数据
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
                  暂无数据
                </>
              )}
            </span>
          </div>

          {hasNews && cache?.generatedAt && (
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-jetbrains)" }}
            >
              更新于 {relativeTime(cache.generatedAt)}
            </p>
          )}
          {!hasNews && !loading && (
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-jetbrains)" }}
            >
              管理员还未更新内容
            </p>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <SkeletonGrid key="skeleton" />
        ) : !hasNews ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key="grid"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {cache!.items.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 gap-4"
      style={{ color: "rgba(255,255,255,0.25)" }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      >
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
        <path d="M2 7h6v4H2z" />
      </svg>
      <p className="text-sm" style={{ fontFamily: "var(--font-noto-sc)" }}>
        暂无新闻，管理员还未更新
      </p>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass p-5 space-y-3">
          <div className="h-2.5 rounded-full skeleton-pulse w-1/3" />
          <div className="h-3.5 rounded-full skeleton-pulse w-full" />
          <div className="h-3.5 rounded-full skeleton-pulse w-4/5" />
          <div className="h-2.5 rounded-full skeleton-pulse w-full" />
          <div className="h-2.5 rounded-full skeleton-pulse w-2/3" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-14 rounded-full skeleton-pulse" />
            <div className="h-4 w-10 rounded-full skeleton-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── News card ────────────────────────────────────────────────────────────────
function NewsCard({ item, index }: { item: AgentNewsItem; index: number }) {
  return (
    <motion.a
      href={item.url === "#" ? undefined : item.url}
      target={item.url === "#" ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="glass flex flex-col p-5 group"
      style={{
        textDecoration: "none",
        minHeight: 172,
        cursor: item.url === "#" ? "default" : "pointer",
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Meta */}
      <div
        className="flex items-center gap-2 text-xs mb-2.5"
        style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}
      >
        <span style={{ color: "rgba(255,255,255,0.48)", fontWeight: 500 }}>{item.source}</span>
        <span>·</span>
        <span>{relativeTime(item.publishedAt)}</span>
      </div>

      {/* Title */}
      <h3
        className="text-sm font-semibold leading-snug mb-2.5 flex-1 transition-colors duration-200"
        style={{
          fontFamily: "var(--font-noto-sc)",
          color: "rgba(255,255,255,0.82)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.title}
      </h3>

      {/* Summary */}
      <p
        className="text-xs leading-relaxed mb-3"
        style={{
          color: "rgba(255,255,255,0.4)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {item.summary}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 mt-auto pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 2).map((tag) => {
            const c = TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
            return (
              <span
                key={tag}
                className="px-1.5 py-px rounded"
                style={{
                  background: `${c}14`,
                  color: c,
                  border: `1px solid ${c}28`,
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.6rem",
                }}
              >
                #{tag}
              </span>
            );
          })}
        </div>

        {item.url !== "#" && (
          <span
            className="shrink-0 text-xs flex items-center gap-0.5 transition-all duration-200 group-hover:gap-1.5 group-hover:text-blue-400"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            阅读原文
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </motion.a>
  );
}
