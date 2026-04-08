"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          管理登录
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

// ─── Settings page ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [chatEnabled, setChatEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setChatEnabled(d.enableChatWidget !== false))
      .catch(() => {});
  }, []);

  async function toggle(value: boolean) {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enableChatWidget: value }),
      });
      if (res.ok) {
        setChatEnabled(value);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>页面设置</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>管理网站功能开关</p>
        </div>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
      </div>

      <div className="glass p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          页面设置
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-noto-sc)" }}>AI 简历助手</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>
              控制"关于我"页面右下角聊天组件显示
            </p>
          </div>
          <button
            onClick={() => toggle(!chatEnabled)}
            disabled={loading}
            className="relative w-12 h-6 rounded-full transition-all duration-200 disabled:opacity-50"
            style={{
              background: chatEnabled ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${chatEnabled ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            <span
              className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-200"
              style={{
                background: chatEnabled ? "#34d399" : "rgba(255,255,255,0.3)",
                left: chatEnabled ? "22px" : "2px",
              }}
            />
          </button>
        </div>

        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-center"
            style={{ color: "#34d399", fontFamily: "var(--font-jetbrains)" }}
          >
            ✓ 已保存
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
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
        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-4 sm:px-6 py-12 max-w-3xl mx-auto">
          <SettingsPage />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
