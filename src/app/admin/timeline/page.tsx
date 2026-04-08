"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GapSize = "near" | "medium" | "far";

interface TimelineNode {
  id: string;
  year: string;
  nameEN: string;
  nameCN: string;
  oneLiner: string;
  explanation: string;
  learnMoreUrl: string;
  position: number;
  gap: GapSize;
  isFixed?: boolean;
  isTBC?: boolean;
}

const GAP_OPTS: { value: GapSize; label: string }[] = [
  { value: "near",   label: "近" },
  { value: "medium", label: "中" },
  { value: "far",    label: "远" },
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

// ─── Detail edit modal ───────────────────────────────────────────────────────
function DetailModal({
  node,
  onSave,
  onCancel,
}: {
  node: Partial<TimelineNode>;
  onSave: (n: TimelineNode) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TimelineNode>({
    id: node.id ?? "",
    year: node.year ?? "",
    nameEN: node.nameEN ?? "",
    nameCN: node.nameCN ?? "",
    oneLiner: node.oneLiner ?? "",
    explanation: node.explanation ?? "",
    learnMoreUrl: node.learnMoreUrl ?? "#",
    position: node.position ?? 1,
    gap: node.gap ?? "medium",
    isFixed: node.isFixed ?? false,
    isTBC: node.isTBC ?? false,
  });

  const field = (
    key: keyof TimelineNode,
    label: string,
    type = "text",
    extra?: { disabled?: boolean; placeholder?: string }
  ) => {
    const val = form[key] as string | number;
    const style = {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: extra?.disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
      opacity: extra?.disabled ? 0.6 : 1,
    };

    return (
      <div key={key}>
        <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>{label}</label>
        {type === "textarea" ? (
          <textarea value={val as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            rows={3} disabled={extra?.disabled}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={style} placeholder={extra?.placeholder} />
        ) : (
          <input type={type === "number" ? "number" : "text"}
            value={type === "number" ? (val as number) : (val as string)}
            onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
            disabled={extra?.disabled}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={style} placeholder={extra?.placeholder} />
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="glass w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-5" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-space-grotesk)" }}>
          {form.isFixed ? "查看节点" : (node.id ? "编辑节点" : "新增节点")}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {field("year", "年份 / 时期", "text", { placeholder: "如：2023 初" })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field("nameCN", "中文名称", "text", { disabled: form.isFixed, placeholder: form.isFixed ? undefined : "如：变换器架构" })}
            {field("nameEN", "英文名称", "text", { disabled: form.isFixed, placeholder: form.isFixed ? undefined : "如：Transformer" })}
          </div>

          {field("oneLiner", "一句话描述", "textarea")}
          {field("explanation", "详细解释", "textarea")}
          {field("learnMoreUrl", "链接地址", "text", { placeholder: "#" })}

          {form.isTBC && (
            <div className="rounded-lg px-3 py-2 text-xs text-center" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", fontFamily: "var(--font-jetbrains)" }}>
              ← To Be Continued · 路径终点节点
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>
            关闭
          </button>
          {!form.isFixed && (
            <button onClick={() => onSave(form)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
              保存
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Narrative editor ───────────────────────────────────────────────────────
function NarrativeEditor() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/narrative")
      .then((r) => r.json())
      .then((data) => setText(data.text ?? ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/narrative", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass p-5 flex flex-col gap-3 mb-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-space-grotesk)" }}>
            叙事主线
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-jetbrains)" }}>
            首页时间线上方的引导文案，支持 Hi 标签（如 {"(Transformer)"}）
          </p>
        </div>
        {saving ? (
          <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        ) : (
          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}
          >
            {saved ? "✓ 已保存" : "保存"}
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.8)",
          fontFamily: "var(--font-noto-sc)",
          lineHeight: 1.7,
        }}
        placeholder="输入叙事主线内容，支持 Hi 标签格式，如：AI 先学会了阅读（Transformer）..."
      />
    </div>
  );
}

// ─── Timeline list ───────────────────────────────────────────────────────────
function TimelineList() {
  const [nodes, setNodes] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNode, setEditNode] = useState<Partial<TimelineNode> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showAddAt, setShowAddAt] = useState<number | null>(null);

  useEffect(() => { fetchNodes(); }, []);

  async function fetchNodes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/timeline");
      const data = await res.json();
      setNodes((data.items ?? []).sort((a: TimelineNode, b: TimelineNode) => a.position - b.position));
    } finally {
      setLoading(false);
    }
  }

  async function saveNode(node: TimelineNode) {
    const isNew = !nodes.find((n) => n.id === node.id);
    const res = await fetch("/api/admin/timeline", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(node),
    });
    if (res.ok) {
      await fetchNodes();
      setShowModal(false);
      setEditNode(null);
      setShowAddAt(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function deleteNode(id: string) {
    setDeleting(id);
    await fetch("/api/admin/timeline", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setDeleting(null);
  }

  async function updateField(id: string, updates: Partial<TimelineNode>) {
    const updated = nodes.map((n) => n.id === id ? { ...n, ...updates } : n);
    setNodes(updated);
    await fetch("/api/admin/timeline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function openDetail(node: Partial<TimelineNode> = {}) {
    setEditNode(node);
    setShowModal(true);
  }

  const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6"];
  const nonTbcCount = nodes.filter((n) => !n.isTBC).length;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>时间线管理</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
            {nonTbcCount} 个节点 · 按路径位置排序
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
          <button onClick={() => openDetail()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(16,163,127,0.15)", border: "1px solid rgba(16,163,127,0.35)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            新增节点
          </button>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-2.5 rounded-xl text-sm text-center"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontFamily: "var(--font-jetbrains)" }}>
          ✓ 已保存
        </motion.div>
      )}

      {/* Narrative editor */}
      <NarrativeEditor />

      {/* Hint */}
      <div className="mb-4 px-4 py-2.5 rounded-lg text-xs" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-noto-sc)" }}>
        提示：点击排名数字可修改节点位置；「距上一节点」选择近/中/远自动调整路径；固定节点（开始/下一个突破）不可删除。
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>暂无数据</p>
          <button onClick={() => openDetail()} className="text-xs px-4 py-2 rounded-lg"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontFamily: "var(--font-noto-sc)" }}>
            添加第一个节点
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {nodes.map((node, i) => {
              const color = COLORS[i % 3];
              const isFixed = node.isFixed ?? false;
              const isTbcNode = node.isTBC ?? false;
              const canEditName = !isFixed;
              const canEditGap = !isFixed && !isTbcNode;

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-xl"
                  style={{
                    background: isFixed ? "rgba(59,130,246,0.04)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isFixed ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {/* Row: rank | year | name | gap | actions */}
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    {/* Position badge / input */}
                    {canEditName ? (
                      <input
                        type="number"
                        min={1}
                        value={node.position}
                        onChange={(e) => {
                          const newPos = Number(e.target.value);
                          if (newPos >= 1) updateField(node.id, { position: newPos });
                        }}
                        className="shrink-0 w-10 px-1 py-1 rounded-lg text-xs font-bold text-center outline-none"
                        style={{ background: `${color}15`, border: `1px solid ${color}40`, color, fontFamily: "var(--font-jetbrains)" }}
                      />
                    ) : (
                      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "var(--font-jetbrains)" }}>
                        {node.position}
                      </div>
                    )}

                    {/* Year */}
                    <input
                      type="text"
                      value={node.year}
                      onChange={(e) => updateField(node.id, { year: e.target.value })}
                      disabled={isFixed}
                      className="w-20 px-2 py-1 rounded-lg text-xs outline-none text-center shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: isFixed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)",
                        fontFamily: "var(--font-jetbrains)",
                        opacity: isFixed ? 0.6 : 1,
                      }}
                    />

                    {/* CN name */}
                    <input
                      type="text"
                      value={node.nameCN}
                      onChange={(e) => updateField(node.id, { nameCN: e.target.value })}
                      disabled={!canEditName}
                      className="flex-1 min-w-0 px-2 py-1 rounded-lg text-sm outline-none truncate"
                      style={{
                        background: "transparent",
                        color: isTbcNode ? "rgba(167,139,250,0.8)" : isFixed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)",
                        fontFamily: isTbcNode ? "var(--font-jetbrains)" : "var(--font-space-grotesk)",
                        letterSpacing: isTbcNode ? "0.06em" : undefined,
                        opacity: isFixed ? 0.6 : 1,
                      }}
                      placeholder={canEditName ? "中文名称" : undefined}
                    />

                    {/* EN name */}
                    <input
                      type="text"
                      value={node.nameEN}
                      onChange={(e) => updateField(node.id, { nameEN: e.target.value })}
                      disabled={!canEditName}
                      className="w-28 px-2 py-1 rounded-lg text-xs outline-none truncate shrink-0"
                      style={{
                        background: "transparent",
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "var(--font-jetbrains)",
                        opacity: isFixed ? 0.6 : 1,
                      }}
                      placeholder={canEditName ? "English" : undefined}
                    />

                    {/* Gap selector */}
                    {canEditGap ? (
                      <div className="shrink-0 flex gap-0.5">
                        {GAP_OPTS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateField(node.id, { gap: opt.value })}
                            title={`距上一节点：${opt.label}`}
                            className="px-2 py-1 rounded text-xs font-medium transition-all"
                            style={{
                              background: node.gap === opt.value ? `${color}22` : "rgba(255,255,255,0.04)",
                              border: `1px solid ${node.gap === opt.value ? `${color}50` : "rgba(255,255,255,0.08)"}`,
                              color: node.gap === opt.value ? color : "rgba(255,255,255,0.3)",
                              fontFamily: "var(--font-noto-sc)",
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="shrink-0 w-16 text-center">
                        {isTbcNode && (
                          <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", fontFamily: "var(--font-jetbrains)", fontSize: "0.65rem" }}>
                            终点
                          </span>
                        )}
                        {isFixed && !isTbcNode && (
                          <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontFamily: "var(--font-jetbrains)", fontSize: "0.65rem" }}>
                            起点
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openDetail(node)}
                        className="p-1.5 rounded-lg transition-colors hover:text-blue-400"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                        title="编辑详情"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {!isFixed && (
                        <button
                          onClick={() => deleteNode(node.id)}
                          disabled={deleting === node.id}
                          className="p-1.5 rounded-lg transition-colors hover:text-red-400 disabled:opacity-50"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          title="删除"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {showModal && editNode !== null && (
          <DetailModal
            node={editNode}
            onSave={(n) => saveNode(n)}
            onCancel={() => { setShowModal(false); setEditNode(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminTimelinePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/timeline").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
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
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-4 sm:px-6 py-12 max-w-4xl mx-auto">
          <TimelineList />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
