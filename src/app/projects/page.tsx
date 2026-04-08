"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";

interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  status: string;
  statusColor: string;
  github: string;
  demo: string | null;
  highlight: boolean;
}

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-32 rounded-full skeleton-pulse" />
              <div className="h-4 w-12 rounded-full skeleton-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full skeleton-pulse" />
              <div className="h-3 w-4/5 rounded-full skeleton-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-14 rounded-full skeleton-pulse" />
              <div className="h-4 w-18 rounded-full skeleton-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>
          暂无项目
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project, i) => (
        <ScrollReveal key={project.id} delay={i * 0.07}>
          <div
            className="glass flex flex-col h-full p-6 group"
            style={
              project.highlight
                ? {
                    borderColor: "rgba(59,130,246,0.3)",
                    boxShadow: "0 0 30px rgba(59,130,246,0.08)",
                  }
                : {}
            }
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3
                className="text-base font-semibold leading-snug"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {project.highlight && (
                  <span
                    className="text-xs mr-2 px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", verticalAlign: "middle" }}
                  >
                    ★
                  </span>
                )}
                {project.title}
              </h3>
              <span
                className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${project.statusColor}15`,
                  color: project.statusColor,
                  border: `1px solid ${project.statusColor}30`,
                  fontFamily: "var(--font-jetbrains)",
                }}
              >
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed flex-1 mb-4"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {project.desc}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <span key={tag} className="tech-tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <a
                href={project.github === "#" ? undefined : project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              {project.demo && (
                <a
                  href={project.demo ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-blue-400"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Demo
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 tech-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
              Vibe Coding · 边学边做
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 section-title gradient-text">
              我的项目
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              用 AI 工具辅助开发的真实项目，
              <br className="hidden sm:block" />
              每一个都是学习过程的具体输出。
            </p>
          </div>
        </ScrollReveal>

        {/* Projects grid */}
        <ProjectsContent />

        {/* Footer note */}
        <ScrollReveal delay={0.2}>
          <p
            className="text-center mt-16 text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jetbrains)" }}
          >
            // 更多项目持续施工中 · Stay tuned
          </p>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
