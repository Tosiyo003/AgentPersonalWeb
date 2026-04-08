"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Settings {
  enableChatWidget: boolean;
  resumeUrl: string | null;
  agentContext: string;
}

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
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="输入管理密码" autoFocus
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }} />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={!pw}
            className="py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            登录
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Toast banner ──────────────────────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="mb-5 px-4 py-2.5 rounded-xl text-sm text-center"
      style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontFamily: "var(--font-jetbrains)" }}
    >
      ✓ {message}
    </motion.div>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    enableChatWidget: true,
    resumeUrl: null,
    agentContext: "",
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: Settings) => setSettings(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  // ── Toggle agent ────────────────────────────────────────────────────────────
  async function toggleAgent(value: boolean) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enableChatWidget: value }),
    });
    if (res.ok) {
      setSettings((s) => ({ ...s, enableChatWidget: value }));
      showToast("已保存");
    }
    setSaving(false);
  }

  // ── Save agent context ─────────────────────────────────────────────────────
  async function saveAgentContext(agentContext: string) {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentContext }),
    });
    if (res.ok) {
      setSettings((s) => ({ ...s, agentContext }));
      showToast("助手资料库已保存");
    }
    setSaving(false);
  }

  // ── Upload PDF ─────────────────────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("仅支持 PDF 格式");
      return;
    }

    setUploading(true);
    setUploadProgress("上传中...");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (res.ok && json.resumeUrl) {
        setSettings((s) => ({ ...s, resumeUrl: json.resumeUrl }));
        setUploadProgress("上传成功！");
        showToast("简历上传成功");
      } else {
        setUploadProgress("");
        alert(json.error ?? "上传失败");
      }
    } catch {
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ── Delete PDF ─────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("确定删除当前简历文件？")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/upload", { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        setSettings((s) => ({ ...s, resumeUrl: null }));
        showToast("简历已删除");
      } else {
        alert(json.error ?? "删除失败");
      }
    } catch {
      alert("删除失败");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>问答助手设置</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            管理简历文件、AI 助手资料库和开关
          </p>
        </div>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>

      {/* ── Section 1: Agent toggle ── */}
      <div className="glass p-5">
        <h2 className="text-base font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          AI 简历助手
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-noto-sc)" }}>
              开启问答助手
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>
              控制"关于我"页面右下角聊天组件的显示
            </p>
          </div>
          <button
            onClick={() => toggleAgent(!settings.enableChatWidget)}
            disabled={saving}
            className="relative w-12 h-6 rounded-full transition-all duration-200 disabled:opacity-50"
            style={{
              background: settings.enableChatWidget ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${settings.enableChatWidget ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            <span
              className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-200"
              style={{
                background: settings.enableChatWidget ? "#34d399" : "rgba(255,255,255,0.3)",
                left: settings.enableChatWidget ? "22px" : "2px",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Section 2: Resume ── */}
      <div className="glass p-5">
        <h2 className="text-base font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          简历文件管理
        </h2>

        {/* Current file status */}
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="flex-1 min-w-0">
            {settings.resumeUrl ? (
              <>
                <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-noto-sc)" }}>
                  {settings.resumeUrl.split("/").pop()}
                </p>
                <p className="text-xs" style={{ color: "#34d399", fontFamily: "var(--font-jetbrains)" }}>已上传</p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>暂无简历文件</p>
            )}
          </div>
        </div>

        {/* Upload + Delete buttons */}
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
          >
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {uploadProgress}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {settings.resumeUrl ? "更换简历" : "上传简历"}
              </>
            )}
          </button>

          {settings.resumeUrl && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontFamily: "var(--font-noto-sc)" }}
            >
              {deleting ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              )}
              删除
            </button>
          )}
        </div>

        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jetbrains)" }}>
          支持 PDF 格式，最大 10MB。上传新简历会自动删除旧文件。
        </p>
      </div>

      {/* ── Section 3: Agent context ── */}
      <div className="glass p-5">
        <h2 className="text-base font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          助手资料库
        </h2>
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
          手动同步给 AI 助手参考的简历文本。当简历 PDF 变更后，建议同步更新此处内容以确保 AI 回答准确。
        </p>
        <textarea
          value={settings.agentContext}
          onChange={(e) => setSettings((s) => ({ ...s, agentContext: e.target.value }))}
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-y mb-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "var(--font-jetbrains)",
            lineHeight: 1.6,
          }}
          placeholder={"粘贴简历中的关键信息：\n姓名：\n职位：\n技能：\n工作经历：\n..."}
        />
        <button
          onClick={() => saveAgentContext(settings.agentContext)}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}
        >
          {saving ? "保存中..." : "保存资料库"}
        </button>
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
        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-start justify-center px-4 sm:px-6 py-12">
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
