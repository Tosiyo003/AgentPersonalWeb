import PageTransition from "@/components/PageTransition";
import ScrollReveal from "@/components/ScrollReveal";

const categories = [
  {
    title: "AI Agent 入门",
    icon: "🤖",
    color: "#10a37f",
    items: [
      {
        name: "李宏毅 · Agent 大模型系列课程",
        desc: "公认的体验感最好的 Agent 入门课程，覆盖 Agent 核心概念与实战。",
        type: "视频",
        url: "https://www.bilibili.com/video/BV1ArSoBxEZv",
      },
      {
        name: "李宏毅 · 机器学习课程（2023）",
        desc: "台大最受欢迎的 ML 课程，深入浅出，零基础友好。",
        type: "视频",
        url: "https://speech.ee.ntu.edu.tw/cwp-2023-html",
      },
    ],
  },
  {
    title: "入门必读",
    icon: "📖",
    color: "#3b82f6",
    items: [
      {
        name: "3Blue1Brown — Neural Networks",
        desc: "最直观的神经网络可视化讲解，零基础也能看懂反向传播。",
        type: "视频",
        url: "https://www.3blue1brown.com/neural-networks",
      },
      {
        name: "Andrej Karpathy — Zero to Hero",
        desc: "从零手写 GPT，Karpathy 亲授深度学习全链路。",
        type: "视频",
        url: "https://karpathy.ai/zero-to-hero.html",
      },
      {
        name: "fast.ai — Practical Deep Learning",
        desc: "自顶向下的实践派课程，直接上手再补理论。",
        type: "课程",
        url: "https://www.fast.ai",
      },
    ],
  },
  {
    title: "论文精读",
    icon: "📄",
    color: "#06b6d4",
    items: [
      {
        name: "Attention Is All You Need (2017)",
        desc: "Transformer 原始论文，现代 LLM 的基石，必读。",
        type: "论文",
        url: "https://arxiv.org/abs/1706.03762",
      },
      {
        name: "GPT-4 Technical Report",
        desc: "OpenAI GPT-4 技术报告，了解多模态与能力边界。",
        type: "论文",
        url: "https://arxiv.org/abs/2303.08774",
      },
      {
        name: "Constitutional AI (Anthropic)",
        desc: "Claude 背后的对齐技术，RLHF 进阶方向。",
        type: "论文",
        url: "https://arxiv.org/abs/2212.08073",
      },
    ],
  },
  {
    title: "工程实践",
    icon: "⚙️",
    color: "#8b5cf6",
    items: [
      {
        name: "LangChain 文档",
        desc: "构建 LLM 应用的主流框架，RAG / Agent 开发首选。",
        type: "文档",
        url: "https://python.langchain.com",
      },
      {
        name: "Hugging Face 课程",
        desc: "从 Tokenizer 到微调，Transformers 库官方教程。",
        type: "课程",
        url: "https://huggingface.co/learn/nlp-course",
      },
      {
        name: "Prompt Engineering Guide",
        desc: "系统性 Prompt 技巧整理，dair-ai 维护的开源指南。",
        type: "指南",
        url: "https://www.promptingguide.ai",
      },
    ],
  },
  {
    title: "信息源订阅",
    icon: "📡",
    color: "#3b82f6",
    items: [
      {
        name: "The Batch (deeplearning.ai)",
        desc: "吴恩达团队每周 AI 动态，内容精炼，视角专业。",
        type: "Newsletter",
        url: "https://www.deeplearning.ai/the-batch",
      },
      {
        name: "Ahead of AI",
        desc: "Sebastian Raschka 的深度技术分析，偏研究向。",
        type: "Newsletter",
        url: "https://magazine.sebastianraschka.com",
      },
      {
        name: "Latent Space Podcast",
        desc: "AI 工程师访谈，了解一线从业者的真实思考。",
        type: "播客",
        url: "https://latent.space",
      },
    ],
  },
];

const typeColors: Record<string, string> = {
  视频: "#3b82f6",
  课程: "#06b6d4",
  论文: "#8b5cf6",
  文档: "#10b981",
  指南: "#f59e0b",
  Newsletter: "#ec4899",
  播客: "#f97316",
};

export default function ResourcesPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 tech-tag">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
              精选 · 持续维护
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 section-title gradient-text">
              学习资源
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              经过筛选的 AI 学习材料，避免信息过载，
              <br className="hidden sm:block" />
              聚焦真正有价值的内容。
            </p>
          </div>
        </ScrollReveal>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((cat, ci) => (
            <ScrollReveal key={cat.title} delay={ci * 0.1}>
              <div>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-space-grotesk)", color: cat.color }}
                  >
                    {cat.title}
                  </h2>
                  <div
                    className="flex-1 h-px"
                    style={{ background: `linear-gradient(90deg, ${cat.color}40, transparent)` }}
                  />
                </div>

                {/* Items grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.items.map((item, ii) => {
                    const tagColor = typeColors[item.type] ?? "#6b7280";
                    return (
                      <ScrollReveal key={item.name} delay={ci * 0.1 + ii * 0.05}>
                        <a
                          href={item.url}
                          className="glass block p-5 h-full group no-underline"
                          style={{ textDecoration: "none" }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3
                              className="text-sm font-semibold leading-snug"
                              style={{
                                fontFamily: "var(--font-space-grotesk)",
                                color: "rgba(255,255,255,0.88)",
                              }}
                            >
                              {item.name}
                            </h3>
                            <span
                              className="shrink-0 text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: `${tagColor}18`,
                                color: tagColor,
                                border: `1px solid ${tagColor}35`,
                                fontFamily: "var(--font-jetbrains)",
                              }}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {item.desc}
                          </p>
                          <div
                            className="mt-4 flex items-center gap-1 text-xs transition-colors duration-200 group-hover:text-blue-400"
                            style={{ color: "rgba(255,255,255,0.25)" }}
                          >
                            <span>前往查看</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Footer note */}
        <ScrollReveal delay={0.2}>
          <p className="text-center mt-16 text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-jetbrains)" }}>
            // 资源持续更新中 · 如有推荐欢迎 Issue
          </p>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
