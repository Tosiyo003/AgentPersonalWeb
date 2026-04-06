import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";

const projects = [
  {
    title: "AI Journey Website",
    desc: "本站本身——用 Next.js 15 + Tailwind v4 + Framer Motion 构建的个人 AI 学习站，暗黑科技 Liquid Glass 风格。",
    tags: ["Next.js", "Tailwind v4", "Framer Motion", "TypeScript"],
    status: "在建",
    statusColor: "#06b6d4",
    github: "#",
    demo: "#",
    highlight: true,
  },
  {
    title: "Chat with PDF",
    desc: "基于 RAG 的文档问答系统，上传 PDF 后可自然语言提问。使用 LangChain + OpenAI Embeddings + Chroma 向量库。",
    tags: ["RAG", "LangChain", "Python", "Chroma"],
    status: "完成",
    statusColor: "#10b981",
    github: "#",
    demo: "#",
    highlight: false,
  },
  {
    title: "Prompt Playground",
    desc: "可视化 Prompt 调试工具，支持多模型对比、参数调节与输出历史记录，帮助系统化测试 Prompt 效果。",
    tags: ["React", "OpenAI API", "Anthropic API", "Node.js"],
    status: "完成",
    statusColor: "#10b981",
    github: "#",
    demo: "#",
    highlight: false,
  },
  {
    title: "AI 每日简报 Bot",
    desc: "自动抓取 arXiv、HuggingFace、Twitter 等平台 AI 动态，用 Claude 总结后推送到 Telegram 频道。",
    tags: ["Python", "Claude API", "Telegram Bot", "Cron"],
    status: "完成",
    statusColor: "#10b981",
    github: "#",
    demo: "#",
    highlight: false,
  },
  {
    title: "Mini AutoGPT",
    desc: "极简版 AI Agent 实现，支持 Web 搜索、文件读写、代码执行等工具调用，深入理解 Agent Loop 原理。",
    tags: ["Python", "Tool Use", "Agent", "GPT-4"],
    status: "进行中",
    statusColor: "#f59e0b",
    github: "#",
    demo: null,
    highlight: false,
  },
  {
    title: "Fine-tuning 实验室",
    desc: "基于 LoRA 对开源模型进行中文指令微调，记录完整实验流程与参数调优经验。",
    tags: ["LoRA", "PEFT", "LLaMA", "PyTorch"],
    status: "计划中",
    statusColor: "#8b5cf6",
    github: "#",
    demo: null,
    highlight: false,
  },
];

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 tech-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
              Vibe Coding · 边学边做
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 section-title gradient-text">
              我的项目
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              用 AI 工具辅助开发的真实项目，
              <br className="hidden sm:block" />
              每一个都是学习过程的具体输出。
            </p>
          </div>
        </ScrollReveal>

        {/* Projects grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <ScrollReveal key={project.title} delay={i * 0.07}>
              <div
                className="glass flex flex-col h-full p-6 group"
                style={
                  project.highlight
                    ? {
                        borderColor: "rgba(59,130,246,0.3)",
                        boxShadow: "0 0 30px rgba(59,130,246,0.08)",
                      }
                    : {}
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3
                    className="text-base font-semibold leading-snug"
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {project.highlight && (
                      <span
                        className="text-xs mr-2 px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", verticalAlign: "middle" }}
                      >
                        ★ 本站
                      </span>
                    )}
                    {project.title}
                  </h3>
                  <span
                    className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${project.statusColor}15`,
                      color: project.statusColor,
                      border: `1px solid ${project.statusColor}30`,
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-4"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {project.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tech-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    href={project.github}
                    className="flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      className="flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-blue-400"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Demo
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Footer note */}
        <ScrollReveal delay={0.2}>
          <p
            className="text-center mt-16 text-xs"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jetbrains)" }}
          >
            // 更多项目持续施工中 · Stay tuned
          </p>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
