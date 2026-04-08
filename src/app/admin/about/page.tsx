"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AboutData {
  education: EducationItem[];
  experience: ExperienceItem[];
  journey: JourneyItem[];
}

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  period: string;
  highlights: string[];
}

interface ExperienceItem {
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

type Tab = "education" | "experience" | "journey" | "profile";

type Action =
  | "addEducation" | "updateEducation" | "deleteEducation"
  | "addExperience" | "updateExperience" | "deleteExperience"
  | "addJourney" | "updateJourney" | "deleteJourney";

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

// ─── Item editor base ──────────────────────────────────────────────────────────
function ItemEditor<T extends Record<string, string | string[]>>({
  title,
  fields,
  initial,
  onSave,
  onCancel,
}: {
  title: string;
  fields: { key: keyof T; label: string; multiline?: boolean }[];
  initial: T;
  onSave: (data: T) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<T>(initial);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass p-5 mb-4"
      style={{ border: "1px solid rgba(59,130,246,0.25)" }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: "#93c5fd", fontFamily: "var(--font-space-grotesk)" }}>{title}</h3>
      <div className="space-y-3">
        {fields.map((f) =>
          f.multiline ? (
            <div key={f.key as string}>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>{f.label}</label>
              <textarea
                value={Array.isArray(draft[f.key]) ? (draft[f.key] as string[]).join("\n") : draft[f.key] as string}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-noto-sc)", lineHeight: 1.6 }}
              />
            </div>
          ) : (
            <div key={f.key as string}>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>{f.label}</label>
              <input
                type="text"
                value={draft[f.key] as string}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-noto-sc)" }}
              />
            </div>
          )
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSave(draft)}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
          style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}
        >
          取消
        </button>
      </div>
    </motion.div>
  );
}

// ─── Education tab ────────────────────────────────────────────────────────────
function EducationTab({ items, onMutate }: { items: EducationItem[]; onMutate: () => void }) {
  const [editing, setEditing] = useState<EducationItem | null>(null);
  const [adding, setAdding] = useState(false);

  async function saveItem(data: Partial<EducationItem>) {
    const action: Action = editing ? "updateEducation" : "addEducation";
    const normalized = {
      ...data,
      highlights: typeof data.highlights === "string"
        ? (data.highlights as string).split("\n").map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(data.highlights) ? data.highlights : []),
    };
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: editing?.id, data: normalized }),
    });
    setEditing(null);
    setAdding(false);
    onMutate();
  }

  async function deleteItem(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteEducation", id }),
    });
    onMutate();
  }

  const fields = [
    { key: "school" as const, label: "学校" },
    { key: "degree" as const, label: "学位" },
    { key: "period" as const, label: "时间" },
    { key: "highlights" as const, label: "亮点（每行一条）", multiline: true },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setAdding(true); setEditing(null); }}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
        >
          + 添加
        </button>
      </div>
      <AnimatePresence>
        {adding && (
          <ItemEditor
            title="添加教育背景"
            fields={fields}
            initial={{ school: "", degree: "", period: "", highlights: [] }}
            onSave={saveItem}
            onCancel={() => setAdding(false)}
          />
        )}
        {editing && (
          <ItemEditor
            title="编辑教育背景"
            fields={fields}
            initial={editing}
            onSave={saveItem}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}>{item.school}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontFamily: "var(--font-jetbrains)" }}>{item.period}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>{item.degree}</p>
              {(Array.isArray(item.highlights) ? item.highlights : []).map((h) => (
                <p key={h} className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>· {h}</p>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(item); setAdding(false); }} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(255,255,255,0.35)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(239,68,68,0.5)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Experience tab ──────────────────────────────────────────────────────────
function ExperienceTab({ items, onMutate }: { items: ExperienceItem[]; onMutate: () => void }) {
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [adding, setAdding] = useState(false);

  async function saveItem(data: Partial<ExperienceItem>) {
    const action: Action = editing ? "updateExperience" : "addExperience";
    const normalized = {
      ...data,
      highlights: typeof data.highlights === "string"
        ? (data.highlights as string).split("\n").map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(data.highlights) ? data.highlights : []),
    };
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: editing?.id, data: normalized }),
    });
    setEditing(null);
    setAdding(false);
    onMutate();
  }

  async function deleteItem(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteExperience", id }),
    });
    onMutate();
  }

  const fields = [
    { key: "company" as const, label: "公司" },
    { key: "role" as const, label: "职位" },
    { key: "period" as const, label: "时间" },
    { key: "highlights" as const, label: "工作亮点（每行一条）", multiline: true },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setAdding(true); setEditing(null); }}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
        >
          + 添加
        </button>
      </div>
      <AnimatePresence>
        {adding && (
          <ItemEditor
            title="添加工作经历"
            fields={fields}
            initial={{ company: "", role: "", period: "", highlights: [] }}
            onSave={saveItem}
            onCancel={() => setAdding(false)}
          />
        )}
        {editing && (
          <ItemEditor
            title="编辑工作经历"
            fields={fields}
            initial={editing}
            onSave={saveItem}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}>{item.company}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", fontFamily: "var(--font-jetbrains)" }}>{item.period}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>{item.role}</p>
              {(Array.isArray(item.highlights) ? item.highlights : []).map((h) => (
                <p key={h} className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>· {h}</p>
              ))}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(item); setAdding(false); }} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(255,255,255,0.35)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(239,68,68,0.5)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Journey tab ──────────────────────────────────────────────────────────────
function JourneyTab({ items, onMutate }: { items: JourneyItem[]; onMutate: () => void }) {
  const [editing, setEditing] = useState<JourneyItem | null>(null);
  const [adding, setAdding] = useState(false);

  async function saveItem(data: Partial<JourneyItem>) {
    const action: Action = editing ? "updateJourney" : "addJourney";
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id: editing?.id, data }),
    });
    setEditing(null);
    setAdding(false);
    onMutate();
  }

  async function deleteItem(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/admin/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteJourney", id }),
    });
    onMutate();
  }

  const fields = [
    { key: "period" as const, label: "时间" },
    { key: "event" as const, label: "事件" },
    { key: "desc" as const, label: "描述", multiline: true },
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setAdding(true); setEditing(null); }}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
          style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
        >
          + 添加
        </button>
      </div>
      <AnimatePresence>
        {adding && (
          <ItemEditor
            title="添加学习历程"
            fields={fields}
            initial={{ period: "", event: "", desc: "" }}
            onSave={saveItem}
            onCancel={() => setAdding(false)}
          />
        )}
        {editing && (
          <ItemEditor
            title="编辑学习历程"
            fields={fields}
            initial={editing}
            onSave={saveItem}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontFamily: "var(--font-jetbrains)" }}>{item.period}</span>
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>{item.event}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>{item.desc}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setEditing(item); setAdding(false); }} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(255,255,255,0.35)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "rgba(239,68,68,0.5)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile tab ─────────────────────────────────────────────────────────────
function ProfileTab({
  settings,
  onSave,
}: {
  settings: { name: string; title: string; email: string; github: string; bio: string };
  onSave: (field: string, value: string) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const fields: { key: keyof typeof settings; label: string; multiline?: boolean }[] = [
    { key: "name", label: "姓名" },
    { key: "title", label: "职位头衔" },
    { key: "email", label: "邮箱" },
    { key: "github", label: "GitHub 主页" },
    { key: "bio", label: "个人介绍（显示在关于我页面顶部）", multiline: true },
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>
            {f.label}
          </label>
          {f.multiline ? (
            <textarea
              value={draft[f.key]}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--font-noto-sc)",
                lineHeight: 1.7,
              }}
              placeholder={f.key === "bio" ? "例如：你好，我是 KK，一名解决方案工程师..." : undefined}
            />
          ) : (
            <input
              type={f.key === "email" ? "email" : "text"}
              value={draft[f.key]}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--font-noto-sc)",
              }}
              placeholder={
                f.key === "name" ? "KK" :
                f.key === "title" ? "解决方案工程师" :
                f.key === "email" ? "kkaicon@example.com" :
                f.key === "github" ? "https://github.com" : undefined
              }
            />
          )}
        </div>
      ))}
      <button
        onClick={() => {
          Object.entries(draft).forEach(([k, v]) => {
            if (draft[k as keyof typeof draft] !== settings[k as keyof typeof settings]) {
              onSave(k, v);
            }
          });
        }}
        className="px-5 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
        style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
      >
        保存全部
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminAboutPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [about, setAbout] = useState<AboutData | null>(null);
  const [settings, setSettings] = useState<{ name: string; title: string; email: string; github: string; bio: string }>({
    name: "", title: "", email: "", github: "", bio: "",
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
  }, []);

  function loadAbout() {
    fetch("/api/admin/about").then((r) => r.json()).then((d: AboutData) => setAbout(d));
  }

  function loadSettings() {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d: { name?: string; title?: string; email?: string; github?: string; bio?: string }) =>
        setSettings({
          name: d.name || "",
          title: d.title || "",
          email: d.email || "",
          github: d.github || "",
          bio: d.bio || "",
        })
      );
  }

  useEffect(() => {
    if (authed) {
      loadAbout();
      loadSettings();
    }
  }, [authed]);

  async function saveSettingsField(field: string, value: string) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSettings((s) => ({ ...s, [field]: value }));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "个人信息" },
    { key: "education", label: "教育背景" },
    { key: "experience", label: "工作经历" },
    { key: "journey", label: "学习历程" },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>关于我管理</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            管理个人信息、教育背景、工作经历和学习历程
          </p>
        </div>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === t.key ? "rgba(59,130,246,0.2)" : "transparent",
              border: tab === t.key ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              color: tab === t.key ? "#93c5fd" : "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-noto-sc)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
            {tab === "profile" && (
              <ProfileTab
                settings={settings}
                onSave={(field, value) => { saveSettingsField(field, value); showToast("已保存"); }}
              />
            )}
            {tab !== "profile" && about && (
              <>
                {tab === "education" && (
                  <EducationTab
                    items={about.education}
                    onMutate={() => { loadAbout(); showToast("已保存"); }}
                  />
                )}
                {tab === "experience" && (
                  <ExperienceTab
                    items={about.experience}
                    onMutate={() => { loadAbout(); showToast("已保存"); }}
                  />
                )}
                {tab === "journey" && (
                  <JourneyTab
                    items={about.journey}
                    onMutate={() => { loadAbout(); showToast("已保存"); }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
    </div>
  );
}
