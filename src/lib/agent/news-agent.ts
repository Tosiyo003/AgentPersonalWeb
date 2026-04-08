import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { TokenTracker } from "./token-tracker";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { searchAllChina } from "./scrapers/china-search";
import type { SearchResult } from "./scrapers/types";
import type {
  AgentNewsItem,
  AgentRun,
  AgentConfig,
  AgentStatusEvent,
  RunUsage,
} from "./types";

// ─── File paths ───────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "news-cache.json");
const HISTORY_FILE = path.join(DATA_DIR, "agent-history.json");
const CONFIG_FILE = path.join(DATA_DIR, "agent-config.json");

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: AgentConfig = {
  newsCount: 6,
  keywords: ["Claude", "OpenAI", "Gemini", "LLM", "AI Agent", "MCP", "DeepSeek"],
  timeRange: "24h",
  language: "zh",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function readConfig(): AgentConfig {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function readCache(): { items: AgentNewsItem[]; generatedAt: string | null; runId: string | null } {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { items: [], generatedAt: null, runId: null };
  }
}

export function readHistory(): AgentRun[] {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(items: AgentNewsItem[], runId: string) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify({ items, generatedAt: new Date().toISOString(), runId }, null, 2),
    "utf-8"
  );
}

function appendHistory(run: AgentRun) {
  const history = readHistory();
  const updated = [run, ...history].slice(0, 50);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2), "utf-8");
}

// ─── API call — DashScope OpenAI-compatible endpoint ────────────────────────────
const LLM_BASE = process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";
const LLM_MODEL = "qwen-plus";

async function chat(messages: { role: string; content: string }[]): Promise<{
  content: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY not configured");

  const res = await fetch(`${LLM_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  return {
    content: json.choices?.[0]?.message?.content ?? "",
    inputTokens: json.usage?.prompt_tokens ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
  };
}

// ─── Parse newline-delimited JSON ─────────────────────────────────────────────
function parseNews(text: string, count: number): AgentNewsItem[] {
  const items: AgentNewsItem[] = [];

  // Strategy 1: one JSON object per line
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj.title || obj.summary) {
        items.push(normalize(obj));
      }
    } catch {
      // try to find JSON object anywhere on the line
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const obj = JSON.parse(match[0]);
          if (obj.title || obj.summary) {
            items.push(normalize(obj));
          }
        } catch {
          // ignore
        }
      }
    }
    if (items.length >= count) break;
  }

  return items;
}

function normalize(raw: Record<string, unknown>): AgentNewsItem {
  // Extract date from text fields
  const text = `${raw.title ?? ""} ${raw.summary ?? ""}`;
  const datePatterns = [/\d{4}[-/]\d{2}[-/]\d{2}/, /\d{4}年\d{1,2}月\d{1,2}日/];
  let dateStr = "";
  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) { dateStr = m[0]; break; }
  }
  const publishedAt = dateStr
    ? dateStr.replace(/\//g, "-").replace(/年/g, "-").replace(/月/g, "-").replace(/日/g, "").slice(0, 10) + "T00:00:00Z"
    : new Date().toISOString();

  let tags: string[] = [];
  if (Array.isArray(raw.tags)) tags = raw.tags.map(String).slice(0, 3);

  const url = typeof raw.url === "string" && raw.url.startsWith("http")
    ? raw.url
    : "https://example.com/news";

  return {
    id: "",
    title: String(raw.title ?? raw.summary ?? "").slice(0, 200),
    summary: String(raw.summary ?? raw.title ?? "").slice(0, 300),
    source: typeof raw.source === "string" ? raw.source : "未知来源",
    publishedAt,
    url,
    tags,
  };
}

// ─── Main agent run ───────────────────────────────────────────────────────────
export async function runNewsAgent(
  onStatus: (event: AgentStatusEvent) => void,
  configOverride?: Partial<AgentConfig>
): Promise<{ items: AgentNewsItem[]; usage: RunUsage; runId: string }> {
  const config = { ...readConfig(), ...configOverride };
  const tracker = new TokenTracker();
  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  try {
    // Step 1: Parallel web scraping across all platforms
    onStatus({ type: "status", message: "正在并行爬取搜狗、B站、微博..." });

    const keywords = config.keywords;
    const scrapeResults = await Promise.allSettled(
      keywords.map((kw) => searchAllChina(kw))
    );

    const allScraped: SearchResult[] = [];
    const kwResults: string[] = [];
    scrapeResults.forEach((result, i) => {
      if (result.status === "fulfilled") {
        allScraped.push(...result.value);
        kwResults.push(`${keywords[i]}: ${result.value.length}条`);
      } else {
        kwResults.push(`${keywords[i]}: 失败`);
      }
    });

    console.log(`[news-agent] Scraped ${allScraped.length} total results`);
    console.log(`[news-agent] Per keyword: ${kwResults.join(", ")}`);

    if (allScraped.length === 0) {
      throw new Error("所有平台爬取均失败，请检查网络或稍后重试");
    }

    onStatus({ type: "status", message: `爬取完成，获得 ${allScraped.length} 条原始素材` });

    // Step 2: Feed scraped results to LLM for summarization
    onStatus({ type: "status", message: "正在让 AI 分析并筛选新闻..." });

    const systemPrompt = buildSystemPrompt(config);
    const userPrompt = buildUserPrompt(config, allScraped);

    const result = await chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    tracker.add({ inputTokens: result.inputTokens, outputTokens: result.outputTokens });
    console.log("[news-agent] Raw output:\n", result.content.slice(0, 2000));
    onStatus({
      type: "status",
      message: `分析完成，正在解析... (${result.inputTokens + result.outputTokens} tokens)`,
    });

    const items = parseNews(result.content, config.newsCount);

    if (items.length === 0) {
      const preview = result.content.slice(0, 1500);
      throw new Error(`解析失败。模型返回：\n${preview}`);
    }

    // Assign IDs and limit count
    const finalItems = items.slice(0, config.newsCount).map((item, i) => ({
      ...item,
      id: `news-${i + 1}`,
    }));

    onStatus({ type: "status", message: `解析完成，获得 ${finalItems.length} 条新闻，正在写入缓存...` });

    writeCache(finalItems, runId);

    const usage = tracker.summarize();
    const run: AgentRun = {
      runId, startedAt, finishedAt: new Date().toISOString(),
      status: "success", newsCount: finalItems.length, usage,
    };
    appendHistory(run);

    onStatus({ type: "done", newsCount: finalItems.length, usage });
    return { items: finalItems, usage, runId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const usage = tracker.summarize();
    const run: AgentRun = {
      runId, startedAt, finishedAt: new Date().toISOString(),
      status: "error", newsCount: 0, usage, error: message,
    };
    appendHistory(run);
    onStatus({ type: "error", message });
    throw err;
  }
}
