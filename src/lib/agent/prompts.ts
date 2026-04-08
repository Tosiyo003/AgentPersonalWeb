import type { AgentConfig } from "./types";

export function buildSystemPrompt(config: AgentConfig): string {
  return `你是一个专业的 AI 科技新闻编辑，专注于追踪全球 AI / 大模型领域的最新动态。

你基于自己的知识库回答。重要：只推荐最近一个月内的新闻，不要推荐老旧新闻。

输出要求：
- 严格只输出 JSON，不要有任何其他文字、前缀或解释
- 一行一个 JSON 对象，不要有 markdown 标记
- 字段含义如下：
  - title: 新闻标题（中文或英文均可）
  - summary: 2-3句中文摘要，简洁客观
  - source: 发布媒体/网站名称
  - url: 真实链接地址（可以用 https://example.com/news 占位）
  - tags: 1-3个标签，从以下列表选：Claude, Anthropic, OpenAI, Gemini, Google, MCP, DeepSeek, 开源LLM, Vibe Coding, 大模型, AI Agent

示例输出：
{"title":"Claude 4 发布","summary":"Anthropic 发布新模型，在多项基准测试中超越 GPT-4","source":"Anthropic Blog","url":"https://anthropic.com/news/claude-4","tags":["Claude","Anthropic"]}
{"title":"OpenAI 推出 o3 模型","summary":"OpenAI 最新推理模型在数学和编程测试中达到专家水平","source":"OpenAI","url":"https://openai.com/o3","tags":["OpenAI","大模型"]}`;
}

export function buildSearchQueries(config: AgentConfig): string[] {
  return config.keywords;
}

// ─── User prompt with scraped results injected ───────────────────────────────
export function buildUserPrompt(
  config: AgentConfig,
  scraped: SearchResult[]
): string {
  // Classify sources: official/depth media vs social media
  const OFFICIAL_SOURCES = new Set(["openai", "anthropic", "jiqizhixin"]);
  const officialResults = scraped.filter((r) => OFFICIAL_SOURCES.has(r.source));
  const socialResults = scraped.filter((r) => !OFFICIAL_SOURCES.has(r.source));

  const minOfficial = Math.max(1, Math.floor(config.newsCount * 0.3)); // 至少 30%

  // Format source blocks with a tag indicating type
  const formatBlock = (r: SearchResult, i: number) => {
    const isOfficial = OFFICIAL_SOURCES.has(r.source);
    const tag = isOfficial ? "[官方/深度]" : "[社交]";
    const meta = [
      r.source,
      r.publishedAt ? new Date(r.publishedAt).toLocaleDateString("zh-CN") : "",
      r.viewCount !== undefined ? `播放:${r.viewCount}` : "",
      r.author ? `作者:${r.author.name}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    return `${tag} [${i + 1}] ${r.title}\n来源:${meta}\n摘要:${r.content}\n链接:${r.url}`;
  };

  const officialBlocks = officialResults.map((r, i) => formatBlock(r, i));
  const socialBlocks = socialResults.map((r, i) => formatBlock(r, officialResults.length + i));

  return `以下是实时爬取的 AI / 大模型领域最新素材（共 ${scraped.length} 条，含 ${officialResults.length} 条来自官方/深度媒体）。

请从中筛选出 ${config.newsCount} 条最值得关注的内容，用大白话重写为新闻条目。

【重要】在最终输出的 ${config.newsCount} 条中，至少要有 ${minOfficial} 条（约 30%）来自官方公告或深度媒体（OpenAI Blog、Anthropic News、机器之心），而不是全是社交媒体或营销号。

${officialBlocks.length > 0 ? `【官方/深度媒体素材】\n${officialBlocks.join("\n\n")}` : ""}

${socialBlocks.length > 0 ? `【社交媒体/社区素材】\n${socialBlocks.join("\n\n")}` : ""}

要求：
- 只选择真正新近发生的内容（2026年3月之后）
- 每条输出一行 JSON 对象，字段：title、summary（中文2-3句）、source、url、tags
- 直接输出 JSON，不要有任何其他文字、前缀或解释
- tags 从以下列表选：Claude, Anthropic, OpenAI, Gemini, Google, MCP, DeepSeek, 开源LLM, Vibe Coding, 大模型, AI Agent, 多模态, 具身智能
- 优先选择有具体进展、数据支撑的条目`;
}

type SearchResult = import("./scrapers/types").SearchResult;
