"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
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

const STATUS_OPTIONS = [
  { label: "完成", color: "#10b981" },
  { label: "进行中", color: "#f59e0b" },
  { label: "在建", color: "#06b6d4" },
  { label: "计划中", color: "#8b5cf6" },
];

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

// ─── Project edit modal ───────────────────────────────────────────────────────
function ProjectModal({
  project,
  onSave,
  onCancel,
}: {
  project?: Partial<Project>;
  onSave: (data: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: project?.title ?? "",
    desc: project?.desc ?? "",
    tags: (project?.tags ?? []).join(", "),
    status: project?.status ?? "计划中",
    statusColor: project?.statusColor ?? "#8b5cf6",
    github: project?.github ?? "#",
    demo: project?.demo ?? "",
    highlight: project?.highlight ?? false,
  });

  const statusOpt = STATUS_OPTIONS.find((s) => s.label === form.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass w-full max-w-md p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-5" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>
          {project?.title ? "编辑项目" : "新增项目"}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>项目名称</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
              placeholder="如：Mini AutoGPT" />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>描述</label>
            <textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
              placeholder="简短描述项目内容…" />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>技术标签（逗号分隔）</label>
            <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }}
              placeholder="如：Python, LangChain, RAG" />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>状态</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button key={s.label} onClick={() => setForm((f) => ({ ...f, status: s.label, statusColor: s.color }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.status === s.label ? `${s.color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.status === s.label ? `${s.color}50` : "rgba(255,255,255,0.1)"}`,
                    color: form.status === s.label ? s.color : "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-noto-sc)",
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>GitHub 链接</label>
              <input value={form.github} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }}
                placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>Demo 链接</label>
              <input value={form.demo ?? ""} onChange={(e) => setForm((f) => ({ ...f, demo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }}
                placeholder="https://..." />
            </div>
          </div>

          {/* Highlight toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, highlight: !f.highlight }))}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: form.highlight ? "#3b82f6" : "rgba(255,255,255,0.1)" }}
            >
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.highlight ? "22px" : "2px" }} />
            </button>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>
              置顶推荐（显示 ★ 标记）
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>
            取消
          </button>
          <button onClick={() => onSave({
            id: project?.id ?? "",
            title: form.title,
            desc: form.desc,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            status: form.status,
            statusColor: form.statusColor,
            github: form.github,
            demo: form.demo || null,
            highlight: form.highlight,
          })}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Projects admin page ─────────────────────────────────────────────────────
function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
    setLoading(false);
  }

  async function saveProject(p: Project) {
    if (p.id) {
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    } else {
      await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    }
    setEditing(null);
    fetchProjects();
  }

  async function deleteProject(id: string) {
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProjects();
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            项目管理
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            {projects.length} 个项目
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
          <button onClick={() => setEditing({})}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            新增项目
          </button>
        </div>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>暂无项目</p>
          <button onClick={() => setEditing({})}
            className="text-xs px-4 py-2 rounded-lg"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            添加第一个项目
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {projects.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="glass p-5 flex items-start gap-4"
                style={{
                  border: p.highlight ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Highlight star */}
                {p.highlight && (
                  <span className="text-sm shrink-0" style={{ color: "#3b82f6" }}>★</span>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>
                      {p.title}
                    </span>
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${p.statusColor}15`, color: p.statusColor, border: `1px solid ${p.statusColor}30`, fontFamily: "var(--font-jetbrains)", fontSize: "0.65rem" }}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs truncate mb-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-noto-sc)" }}>
                    {p.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-jetbrains)", fontSize: "0.6rem" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(p)}
                    className="p-1.5 rounded-lg transition-colors hover:text-blue-400"
                    style={{ color: "rgba(255,255,255,0.3)" }} title="编辑">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => deleteProject(p.id)}
                    className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                    style={{ color: "rgba(255,255,255,0.3)" }} title="删除">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editing !== null && (
          <ProjectModal
            project={editing}
            onSave={saveProject}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminProjectsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/projects").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
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
        <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ProjectsPage />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
