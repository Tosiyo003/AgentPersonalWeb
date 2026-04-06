import type { NewsItem } from "@/types/news";

// ─── Mock data (shown on initial load / when backend is offline) ─────────────
export const mockNewsData: NewsItem[] = [
  {
    id: "mock-1",
    title: "Claude 3.7 Sonnet 发布：混合推理模式让编程能力再创新高",
    summary:
      "Anthropic 推出 Claude 3.7 Sonnet，引入可切换的「扩展思考」模式，在 SWE-bench 编程基准上得分超越所有现有模型，成为 Vibe Coding 首选工具。",
    source: "Anthropic Blog",
    publishedAt: "2025-04-03T10:00:00Z",
    url: "#",
    tags: ["Claude", "Anthropic"],
  },
  {
    id: "mock-2",
    title: "OpenAI o3 正式开放：复杂数学推理能力接近博士水平",
    summary:
      "OpenAI 将 o3 推理模型正式向公众开放，在 AIME 数学竞赛中达到 96.7% 正确率，在科学推理任务上超越大多数人类专家。",
    source: "OpenAI",
    publishedAt: "2025-04-02T14:30:00Z",
    url: "#",
    tags: ["OpenAI", "推理模型"],
  },
  {
    id: "mock-3",
    title: "Gemini 2.0 Flash 实验版支持实时语音 + 屏幕共享",
    summary:
      "Google 发布 Gemini 2.0 Flash 实验版，支持实时语音对话和屏幕内容理解，Project Astra 的愿景正在逐渐落地。",
    source: "Google DeepMind",
    publishedAt: "2025-04-01T09:00:00Z",
    url: "#",
    tags: ["Gemini", "Google"],
  },
  {
    id: "mock-4",
    title: "MCP 生态爆发：三个月内社区贡献超 500 个 Server",
    summary:
      "Anthropic 的 Model Context Protocol 开源三个月后，社区已贡献超 500 个 MCP Server，正在成为 AI 工具集成的事实标准。",
    source: "GitHub · MCP 社区",
    publishedAt: "2025-03-31T16:00:00Z",
    url: "#",
    tags: ["MCP", "Anthropic"],
  },
  {
    id: "mock-5",
    title: "Cursor 月活突破 400 万：Vibe Coding 不再是边缘概念",
    summary:
      "AI 编程工具 Cursor 公布最新数据，月活跃用户突破 400 万，越来越多的非程序员开始用 Cursor 独立构建产品。",
    source: "Anysphere",
    publishedAt: "2025-03-30T11:00:00Z",
    url: "#",
    tags: ["Cursor", "Vibe Coding"],
  },
  {
    id: "mock-6",
    title: "DeepSeek V3 开源版超越 GPT-4o：训练成本仅为同类模型 1/10",
    summary:
      "深度求索发布 DeepSeek V3 开源版本，在多项基准测试中超越 GPT-4o，再次引发硅谷对 AI 训练效率的深度反思。",
    source: "深度求索",
    publishedAt: "2025-03-28T08:00:00Z",
    url: "#",
    tags: ["DeepSeek", "开源LLM"],
  },
];

// ─── Error type returned by the API Route ────────────────────────────────────
export type FetchError =
  | { type: "offline" }    // backend not running
  | { type: "api"; message: string };  // other error

// ─── Pull latest news from the hot-monitor backend (via Next.js API Route) ──
// Throws FetchError on failure — never falls back silently.
export async function fetchFromBackend(): Promise<NewsItem[]> {
  const res = await fetch("/api/news", { cache: "no-store" });
  const json = await res.json();

  if (!res.ok) {
    if (res.status === 503 && json.error === "backend_offline") {
      throw { type: "offline" } satisfies FetchError;
    }
    throw { type: "api", message: json.error ?? `HTTP ${res.status}` } satisfies FetchError;
  }

  return json.items as NewsItem[];
}

// ─── localStorage cache ───────────────────────────────────────────────────────
const CACHE_KEY = "ai_news_v2";

export interface NewsCache {
  items: NewsItem[];
  fetchedAt: number;
  source: "backend" | "mock";
}

export function loadNewsCache(): NewsCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as NewsCache) : null;
  } catch {
    return null;
  }
}

export function saveNewsCache(items: NewsItem[], source: "backend" | "mock"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ items, fetchedAt: Date.now(), source })
    );
  } catch {
    // Storage full — fail silently
  }
}
