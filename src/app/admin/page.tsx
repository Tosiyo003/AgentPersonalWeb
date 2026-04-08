"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Auth gate ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) onSuccess();
    else setError("密码错误");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>
          管理员登录
        </h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="输入管理密码"
            autoFocus
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }}
          />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={!pw}
            className="py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}
          >
            登录
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Nav card ─────────────────────────────────────────────────────────────────
function NavCard({
  href,
  title,
  desc,
  color,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="glass p-6 flex items-start gap-4"
        style={{ border: `1px solid rgba(255,255,255,0.08)` }}
      >
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold mb-1 group-hover:underline underline-offset-2"
            style={{ color: "rgba(255,255,255,0.88)", fontFamily: "var(--font-space-grotesk)", textDecorationColor: color }}
          >
            {title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-noto-sc)" }}>
            {desc}
          </p>
        </div>
        <svg
          className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </motion.div>
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-2xl font-bold gradient-text-blue"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            管理控制台
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            个人网站 · 管理后台
          </p>
        </div>
        <button
          onClick={logout}
          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-noto-sc)",
          }}
        >
          退出登录
        </button>
      </div>

      {/* Nav grid */}
      <div className="flex flex-col gap-3">
        <NavCard
          href="/admin/news"
          title="AI 新闻管理"
          desc="生成、查看和删除 AI 热点新闻缓存"
          color="#3b82f6"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16v2H4zM4 10h16v2H4zM4 16h10v2H4z" />
            </svg>
          }
        />
        <NavCard
          href="/admin/timeline"
          title="时间线管理"
          desc="编辑 AI 进化时间线节点，支持增删改查和距离设置"
          color="#06b6d4"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round">
              <circle cx="5" cy="12" r="2" />
              <circle cx="19" cy="6" r="2" />
              <circle cx="19" cy="18" r="2" />
              <path d="M7 12h4M13 6l4 6-4 6" />
            </svg>
          }
        />
        <NavCard
          href="/admin/settings"
          title="页面设置"
          desc="控制 AI 简历助手聊天组件的显示与隐藏"
          color="#8b5cf6"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        />
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <a href="/" className="text-xs hover:underline underline-offset-2" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>
          ← 返回首页
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/news").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {authed ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Dashboard />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
