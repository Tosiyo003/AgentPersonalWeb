"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";

interface ResourceItem {
  id: string;
  name: string;
  desc: string;
  type: string;
  url: string;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: ResourceItem[];
}

const typeColors: Record<string, string> = {
  视频: "#3b82f6",
  课程: "#06b6d4",
  论文: "#8b5cf6",
  文档: "#10b981",
  指南: "#f59e0b",
  Newsletter: "#ec4899",
  播客: "#f97316",
};

function ResourcesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        {Array.from({ length: 3 }).map((_, ci) => (
          <div key={ci}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg skeleton-pulse" />
              <div className="h-5 w-28 rounded-full skeleton-pulse" />
              <div className="flex-1 h-px skeleton-pulse" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass p-5 space-y-3">
                  <div className="h-3 w-16 rounded-full skeleton-pulse" />
                  <div className="h-4 w-full rounded-full skeleton-pulse" />
                  <div className="h-3 w-4/5 rounded-full skeleton-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>
          暂无学习资料
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((cat, ci) => (
        <ScrollReveal key={cat.id} delay={ci * 0.1}>
          <div>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{cat.icon}</span>
              <h2
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-space-grotesk)", color: cat.color }}
              >
                {cat.title}
              </h2>
              <div
                className="flex-1 h-px"
                style={{ background: `linear-gradient(90deg, ${cat.color}40, transparent)` }}
              />
            </div>

            {/* Items grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item, ii) => {
                const tagColor = typeColors[item.type] ?? "#6b7280";
                return (
                  <ScrollReveal key={item.id} delay={ci * 0.1 + ii * 0.05}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass block p-5 h-full group no-underline"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3
                          className="text-sm font-semibold leading-snug flex-1"
                          style={{
                            fontFamily: "var(--font-space-grotesk)",
                            color: "rgba(255,255,255,0.88)",
                          }}
                        >
                          {item.name}
                        </h3>
                        <span
                          className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: `${tagColor}18`,
                            color: tagColor,
                            border: `1px solid ${tagColor}35`,
                            fontFamily: "var(--font-jetbrains)",
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {item.desc}
                      </p>
                      <div
                        className="mt-4 flex items-center gap-1 text-xs transition-colors duration-200 group-hover:text-blue-400"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        <span>前往查看</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 tech-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
              精选 · 持续维护
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 section-title gradient-text">
              学习资源
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              经过筛选的 AI 学习材料，避免信息过载，
              <br className="hidden sm:block" />
              聚焦真正有价值的内容。
            </p>
          </div>
        </ScrollReveal>

        {/* Categories */}
        <ResourcesContent />

        {/* Footer note */}
        <ScrollReveal delay={0.2}>
          <p className="text-center mt-16 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-jetbrains)" }}>
            // 资源持续更新中 · 如有推荐欢迎 Issue
          </p>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
