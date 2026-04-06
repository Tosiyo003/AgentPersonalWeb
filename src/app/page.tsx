import PageTransition from "@/components/PageTransition";
import NeuralCanvas from "@/components/NeuralCanvas";
import ZigzagTimeline from "@/components/ZigzagTimeline";
import NewsSection from "@/components/NewsSection";

export default function HomePage() {
  return (
    <PageTransition>
      {/* ══════════════════════════════════════════════════════════ Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-6" style={{ minHeight: "54vh" }}>
        <NeuralCanvas />

        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 text-center max-w-3xl pt-10">
          <div className="inline-flex items-center gap-2 tech-tag mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#3b82f6", boxShadow: "0 0 6px #3b82f6" }}
            />
            13 个关键概念 · 2017–2025
          </div>

          <h1
            className="font-bold mb-4 section-title"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              lineHeight: 1.08,
            }}
          >
            <span className="gradient-text">AI 进化简史</span>
          </h1>

          <p
            className="max-w-lg mx-auto leading-relaxed mb-6"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,255,255,0.42)",
              fontFamily: "var(--font-noto-sc)",
            }}
          >
            从「人工智障」到真正的智能
            <br />
            一份说人话的 AI 概念导览
          </p>

          <ScrollHint />
        </div>
      </section>

      {/* ══════════════════════════════════════════════ Narrative quote */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        <div
          className="relative rounded-2xl px-6 py-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderLeft: "3px solid rgba(59,130,246,0.45)",
          }}
        >
          <span
            className="absolute -top-3 left-5 px-2 text-xs"
            style={{
              background: "#0a0a0f",
              color: "rgba(59,130,246,0.6)",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            // 叙事主线
          </span>
          <p
            className="text-sm leading-loose"
            style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-noto-sc)" }}
          >
            AI 先学会了阅读{" "}
            <Hi c="#3b82f6">（Transformer）</Hi>，通过海量阅读变聪明了{" "}
            <Hi c="#06b6d4">（LLM）</Hi>，学会了说人话{" "}
            <Hi c="#8b5cf6">（ChatGPT）</Hi>，人类也学会了怎么跟它沟通{" "}
            <Hi c="#3b82f6">（Prompt Engineering）</Hi>，然后它学会了查资料{" "}
            <Hi c="#06b6d4">（RAG）</Hi>、学会了自己干活{" "}
            <Hi c="#8b5cf6">（Agent）</Hi>、有了统一的工具接口{" "}
            <Hi c="#3b82f6">（MCP）</Hi>和技能包{" "}
            <Hi c="#06b6d4">（Skills）</Hi>，最后人类可以对着它说话让它写代码{" "}
            <Hi c="#8b5cf6">（Vibe Coding）</Hi>，一群 AI 组队完成复杂任务{" "}
            <Hi c="#3b82f6">（Agentic Workflows）</Hi>。
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ Zigzag timeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Desktop hint */}
        <p
          className="hidden sm:block text-xs text-center mb-6"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jetbrains)" }}
        >
          // hover 节点查看详情 · 时间跨度越大间距越宽
        </p>
        {/* Mobile hint */}
        <p
          className="sm:hidden text-xs text-center mb-4"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jetbrains)" }}
        >
          // 点击节点展开详情
        </p>

        <ZigzagTimeline />
      </section>

      {/* ══════════════════════════════════════════════════ Divider */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.25))" }} />
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs"
            style={{
              border: "1px solid rgba(59,130,246,0.2)",
              color: "rgba(59,130,246,0.6)",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
            LIVE
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.25), transparent)" }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ News */}
      <NewsSection />
    </PageTransition>
  );
}

/* ── Inline highlight ── */
function Hi({ children, c }: { children: React.ReactNode; c: string }) {
  return <span style={{ color: c, fontWeight: 500 }}>{children}</span>;
}

/* ── Scroll hint ── */
function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-1 opacity-35">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-0.5 h-1.5 rounded-full bg-blue-400"
          style={{ animation: `scrollPulse 1.4s ease ${i * 0.22}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.2; transform: translateY(-2px); }
          50% { opacity: 0.9; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
