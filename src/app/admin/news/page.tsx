"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentRun, AgentNewsItem } from "@/lib/agent/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtCost(usd: number) {
  if (usd < 0.001) return "<$0.001";
  return `$${usd.toFixed(4)}`;
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

// ─── Generate panel ───────────────────────────────────────────────────────────
function GeneratePanel({ onGenerated }: { onGenerated: () => void }) {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ newsCount: number; cost: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  async function generate() {
    setRunning(true);
    setLog(["开始生成..."]);
    setLastResult(null);

    try {
      const res = await fetch("/api/admin/news/generate", { method: "POST" });
      if (!res.ok || !res.body) { setLog((l) => [...l, "请求失败"]); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const chunk of lines) {
          const dataLine = chunk.trim();
          if (!dataLine.startsWith("data:")) continue;
          try {
            const event = JSON.parse(dataLine.slice(5).trim());
            if (event.type === "status") setLog((l) => [...l, event.message]);
            else if (event.type === "done") {
              setLog((l) => [...l, `✓ 完成！共 ${event.newsCount} 条新闻`]);
              setLastResult({ newsCount: event.newsCount, cost: fmtCost(event.usage.estimatedCostUSD) });
              onGenerated();
            } else if (event.type === "error") setLog((l) => [...l, `✗ 错误：${event.message}`]);
          } catch {}
        }
      }
    } catch (err) {
      setLog((l) => [...l, `请求异常：${String(err)}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          生成新闻
        </h2>
        <button
          onClick={generate}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "rgba(16,163,127,0.12)", border: "1px solid rgba(16,163,127,0.3)", color: "#34d399", fontFamily: "var(--font-noto-sc)" }}
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            animate={{ rotate: running ? 360 : 0 }}
            transition={running ? { duration: 0.7, ease: "linear", repeat: Infinity } : { duration: 0.25 }}
          >
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </motion.svg>
          {running ? "生成中…" : "立即生成"}
        </button>
      </div>

      {log.length > 0 && (
        <div ref={logRef} className="rounded-xl p-4 max-h-48 overflow-y-auto flex flex-col gap-1"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {log.map((line, i) => (
            <p key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-jetbrains)" }}>{line}</p>
          ))}
        </div>
      )}

      {lastResult && (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "rgba(16,163,127,0.07)", border: "1px solid rgba(16,163,127,0.2)" }}>
          <span style={{ color: "#34d399", fontFamily: "var(--font-jetbrains)" }}>{lastResult.newsCount} 条</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)", fontSize: "0.75rem" }}>消耗 {lastResult.cost}</span>
        </div>
      )}
    </div>
  );
}

// ─── News list panel ─────────────────────────────────────────────────────────
function NewsListPanel({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<{ items: AgentNewsItem[]; generatedAt: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/admin/news").then((r) => r.json()).then(setData).catch(() => {});
  }, [refreshKey]);

  async function deleteItem(id: string) {
    await fetch("/api/admin/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setData((prev) => prev ? { ...prev, items: prev.items.filter((it) => it.id !== id) } : prev);
  }

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>
          当前新闻缓存
          {data?.items?.length !== undefined && (
            <span className="ml-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>({data.items.length} 条)</span>
          )}
        </h2>
        {data?.generatedAt && (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-jetbrains)" }}>{fmtDate(data.generatedAt)}</span>
        )}
      </div>

      {!data ? (
        <p className="text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>加载中…</p>
      ) : data.items.length === 0 ? (
        <p className="text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>暂无缓存，请先生成</p>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {data.items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={item.url !== "#" ? item.url : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium leading-snug hover:text-blue-400 transition-colors line-clamp-2"
                    style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-noto-sc)" }}
                  >
                    {item.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>
                    <span>{item.source}</span><span>·</span><span>{fmtDate(item.publishedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-400"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  title="删除"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────────
function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const [history, setHistory] = useState<AgentRun[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/history").then((r) => r.json()).then(setHistory).catch(() => {});
  }, [refreshKey]);

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-space-grotesk)" }}>运行历史</h2>
      {!history ? (
        <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>加载中…</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-noto-sc)" }}>暂无运行记录</p>
      ) : (
        <div className="flex flex-col gap-2">
          {history.slice(0, 10).map((run) => (
            <div key={run.runId} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ background: run.status === "success" ? "#34d399" : "#f87171" }} />
              <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jetbrains)" }}>{fmtDate(run.startedAt)}</span>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>
              {run.status === "success" ? (
                <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-noto-sc)" }}>{run.newsCount} 条</span>
              ) : (
                <span className="truncate max-w-xs" style={{ color: "#f87171", fontFamily: "var(--font-noto-sc)" }}>{run.error ?? "未知错误"}</span>
              )}
              <span className="ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-jetbrains)" }}>{fmtCost(run.usage.estimatedCostUSD)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── News page ───────────────────────────────────────────────────────────────
function NewsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-blue" style={{ fontFamily: "var(--font-space-grotesk)" }}>AI 新闻管理</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-jetbrains)" }}>AI 热点速递 · 新闻生成管理</p>
        </div>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-noto-sc)" }}>← 返回</a>
      </div>

      <GeneratePanel onGenerated={() => setRefreshKey((k) => k + 1)} />
      <NewsListPanel refreshKey={refreshKey} />
      <HistoryPanel refreshKey={refreshKey} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminNewsPage() {
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
        <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-4 sm:px-6 py-12 max-w-3xl mx-auto">
          <NewsPage />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginForm onSuccess={() => setAuthed(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
