"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
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

const TYPE_OPTIONS = ["视频", "课程", "论文", "文档", "指南", "Newsletter", "播客"];

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

// ─── Item edit modal ──────────────────────────────────────────────────────────
function ItemModal({
  item,
  categoryId,
  onSave,
  onCancel,
}: {
  item?: Partial<ResourceItem>;
  categoryId: string;
  onSave: (data: ResourceItem, categoryId: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    desc: item?.desc ?? "",
    type: item?.type ?? "视频",
    url: item?.url ?? "",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass w-full max-w-md p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-5" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>
          {item?.name ? "编辑资源" : "新增资源"}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>名称</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
              placeholder="如：李宏毅 · Agent 大模型系列课程" />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>类型</label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.type === t ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.type === t ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.1)"}`,
                    color: form.type === t ? "#93c5fd" : "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-noto-sc)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>描述</label>
            <textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
              placeholder="简短描述资源内容…" />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>链接</label>
            <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-jetbrains)" }}
              placeholder="https://..." />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>
            取消
          </button>
          <button onClick={() => onSave({ id: item?.id ?? "", ...form }, categoryId)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, onUpdated }: { cat: Category; onUpdated: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ResourceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveCategory(updates: Partial<Category>) {
    setSaving(true);
    await fetch("/api/admin/resources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateCategory", id: cat.id, ...updates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onUpdated();
  }

  async function addItem(data: ResourceItem, categoryId: string) {
    if (data.id) {
      // update
      await fetch("/api/admin/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateItem", categoryId, itemId: data.id, name: data.name, desc: data.desc, type: data.type, url: data.url }),
      });
    } else {
      await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addItem", categoryId, name: data.name, desc: data.desc, type: data.type, url: data.url }),
      });
    }
    setEditingItem(null);
    onUpdated();
  }

  async function deleteItem(itemId: string) {
    await fetch("/api/admin/resources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteItem", categoryId: cat.id, itemId }),
    });
    onUpdated();
  }

  return (
    <>
      <div className="glass overflow-hidden">
        {/* Category header */}
        <div className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
          {/* Icon */}
          <input value={cat.icon} onChange={(e) => saveCategory({ icon: e.target.value })}
            className="w-9 h-9 rounded-lg text-center text-lg outline-none shrink-0"
            style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30`, fontFamily: "var(--font-jetbrains)" }} />

          {/* Title */}
          <input value={cat.title} onChange={(e) => saveCategory({ title: e.target.value })}
            className="flex-1 text-sm font-semibold outline-none bg-transparent"
            style={{ color: cat.color, fontFamily: "var(--font-space-grotesk)" }} />

          {/* Color picker */}
          <input type="color" value={cat.color} onChange={(e) => saveCategory({ color: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer shrink-0" style={{ border: "none", padding: 0 }} title="选择颜色" />

          {/* Item count */}
          <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-jetbrains)" }}>
            {cat.items.length} 项
          </span>

          {/* Save indicator */}
          {saved && (
            <span className="text-xs shrink-0" style={{ color: "#34d399", fontFamily: "var(--font-jetbrains)" }}>✓</span>
          )}

          {/* Toggle */}
          <button onClick={() => setCollapsed((c) => !c)}
            className="shrink-0 p-1 rounded transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-5 py-3 space-y-2">
                {cat.items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {/* Type badge */}
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jetbrains)", fontSize: "0.65rem" }}>
                      {item.type}
                    </span>
                    {/* Name */}
                    <span className="flex-1 text-sm truncate" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-noto-sc)" }}>
                      {item.name}
                    </span>
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg transition-colors hover:text-blue-400"
                        style={{ color: "rgba(255,255,255,0.3)" }} title="编辑">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                        style={{ color: "rgba(255,255,255,0.3)" }} title="删除">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add item button */}
                <button onClick={() => setEditingItem({})}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:scale-102"
                  style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-noto-sc)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  新增资源
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item modal */}
      <AnimatePresence>
        {editingItem !== null && (
          <ItemModal
            item={editingItem}
            categoryId={cat.id}
            onSave={addItem}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Resources admin page ─────────────────────────────────────────────────────
function ResourcesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/resources");
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  }

  async function addCategory() {
    if (!newCatTitle.trim()) return;
    await fetch("/api/admin/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addCategory", title: newCatTitle.trim() }),
    });
    setNewCatTitle("");
    setShowNewCat(false);
    fetchCategories();
  }

  async function deleteCategory(id: string) {
    await fetch("/api/admin/resources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteCategory", id }),
    });
    fetchCategories();
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            学习资料管理
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            {categories.length} 个分类 · 管理员编辑
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
          <button onClick={() => setShowNewCat(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            新增分类
          </button>
        </div>
      </div>

      {/* New category input */}
      <AnimatePresence>
        {showNewCat && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(16,163,127,0.07)", border: "1px solid rgba(16,163,127,0.2)" }}>
            <input value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-noto-sc)" }}
              placeholder="输入分类名称，如：入门必读" autoFocus />
            <button onClick={addCategory}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ background: "rgba(16,163,127,0.2)", border: "1px solid rgba(16,163,127,0.4)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}>
              添加
            </button>
            <button onClick={() => { setShowNewCat(false); setNewCatTitle(""); }}
              className="p-2 rounded-lg transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>暂无分类</p>
          <button onClick={() => setShowNewCat(true)}
            className="text-xs px-4 py-2 rounded-lg"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            添加第一个分类
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} onUpdated={fetchCategories} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminResourcesPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/resources").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
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
        <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ResourcesPage />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
