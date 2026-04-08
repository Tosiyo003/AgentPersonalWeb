"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";
import ChatWidget from "@/components/ChatWidget";

interface Settings {
  name: string;
  title: string;
  email: string;
  github: string;
  bio: string;
  resumeUrl: string | null;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  period: string;
  highlights: string[];
}

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

interface JourneyItem {
  id: string;
  period: string;
  event: string;
  desc: string;
}

interface AboutData {
  education: Education[];
  experience: Experience[];
  journey: JourneyItem[];
}

function AboutContent() {
  const [settings, setSettings] = useState<Settings>({ name: "", title: "", email: "", github: "", bio: "", resumeUrl: null });
  const [about, setAbout] = useState<AboutData>({ education: [], experience: [], journey: [] });

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/about").then((r) => r.json()),
    ]).then(([s, a]) => {
      setSettings({
        name: s.name || "",
        title: s.title || "",
        email: s.email || "",
        github: s.github || "",
        bio: s.bio || "",
        resumeUrl: s.resumeUrl || null,
      });
      setAbout(a);
    }).catch(() => {});
  }, []);

  const displayName = settings.name || "KK";

  return (
    <>
      {/* Hero / Profile */}
      <ScrollReveal>
        <div className="glass p-8 sm:p-10 mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div
            className="shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#93c5fd",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            {displayName}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 tech-tag mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Available · Open to Connect
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3 gradient-text section-title"
              style={{ lineHeight: 1.2 }}
            >
              你好，我是 {displayName}
            </h1>
            {settings.bio ? (
              <p className="text-base leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                {settings.bio}
              </p>
            ) : (
              settings.title && (
                <p className="text-base leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {settings.title}
                </p>
              )
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {settings.github && (
                <a
                  href={settings.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#93c5fd",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  联系我
                </a>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Education (left) + Experience (right) */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Education */}
        <ScrollReveal>
          <div className="glass p-6 h-full flex flex-col">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.85)" }}
            >
              教育背景
            </h2>
            <div className="space-y-5 flex-1">
              {about.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
                    >
                      {edu.school}
                    </h3>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: "#93c5fd", fontFamily: "var(--font-jetbrains)" }}
                    >
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>
                    {edu.degree}
                  </p>
                  {(Array.isArray(edu.highlights) ? edu.highlights : []).map((h) => (
                    <div key={h} className="flex items-start gap-2 mb-1">
                      <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#06b6d4" }} />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* PDF Download */}
              {settings.resumeUrl && (
                <a
                  href={settings.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-102"
                  style={{
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    color: "#93c5fd",
                    fontFamily: "var(--font-noto-sc)",
                    boxShadow: "0 0 16px rgba(59,130,246,0.15), 0 0 32px rgba(139,92,246,0.08)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  下载 PDF 全文
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Experience */}
        <ScrollReveal delay={0.1}>
          <div className="glass p-6 h-full flex flex-col">
            <h2
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.85)" }}
            >
              工作经历
            </h2>
            <div className="space-y-5 flex-1">
              {about.experience.map((job, idx) => (
                <div key={job.id}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
                    >
                      {job.company}
                    </h3>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: idx === 0 ? "#34d399" : "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}
                    >
                      {job.period}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
                    {job.role}
                  </p>
                  {(Array.isArray(job.highlights) ? job.highlights : []).map((h) => (
                    <div key={h} className="flex items-start gap-2 mb-1">
                      <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "rgba(59,130,246,0.6)" }} />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Learning Journey */}
      <ScrollReveal>
        <div className="glass p-6 sm:p-8">
          <h2
            className="text-lg font-semibold mb-8"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "rgba(255,255,255,0.85)" }}
          >
            学习历程
          </h2>
          <div className="relative">
            <div
              className="absolute left-2 top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.4), transparent)" }}
            />
            <div className="space-y-6">
              {about.journey.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.07}>
                  <div className="pl-8 relative">
                    <div
                      className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2"
                      style={{
                        borderColor: i === about.journey.length - 1 ? "#3b82f6" : "rgba(59,130,246,0.4)",
                        background: i === about.journey.length - 1 ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.1)",
                        boxShadow: i === about.journey.length - 1 ? "0 0 12px rgba(59,130,246,0.5)" : "none",
                      }}
                    />
                    <div className="flex items-start gap-3 flex-wrap">
                      <span
                        className="text-xs px-2 py-1 rounded shrink-0"
                        style={{
                          background: "rgba(59,130,246,0.1)",
                          color: "#93c5fd",
                          border: "1px solid rgba(59,130,246,0.2)",
                          fontFamily: "var(--font-jetbrains)",
                        }}
                      >
                        {item.period}
                      </span>
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {item.event}
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <AboutContent />
      </div>
      <ChatWidget />
    </PageTransition>
  );
}
