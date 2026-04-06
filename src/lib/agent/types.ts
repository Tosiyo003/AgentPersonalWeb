// ─── News item stored in cache ────────────────────────────────────────────────
export interface AgentNewsItem {
  id: string;
  title: string;
  summary: string;       // 2–3 sentences, Chinese
  source: string;        // e.g. "TechCrunch", "36氪"
  publishedAt: string;   // ISO 8601
  url: string;
  tags: string[];        // ["Claude", "Anthropic"] etc.
}

// ─── Token usage for one Claude API call ─────────────────────────────────────
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

// ─── Aggregated cost/usage for a full agent run ───────────────────────────────
export interface RunUsage {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCostUSD: number;
}

// ─── One entry in agent-history.json ──────────────────────────────────────────
export interface AgentRun {
  runId: string;
  startedAt: string;    // ISO 8601
  finishedAt: string;
  status: "success" | "error";
  newsCount: number;
  usage: RunUsage;
  error?: string;
}

// ─── Agent configuration (agent-config.json) ──────────────────────────────────
export interface AgentConfig {
  newsCount: number;
  keywords: string[];
  timeRange: "6h" | "12h" | "24h" | "48h" | "7d";
  language: "zh" | "en";
}

// ─── Streaming status event sent to client ────────────────────────────────────
export type AgentStatusEvent =
  | { type: "status"; message: string }
  | { type: "done"; newsCount: number; usage: RunUsage }
  | { type: "error"; message: string };
