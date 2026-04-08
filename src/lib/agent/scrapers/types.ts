// ─── Search result from a single platform ────────────────────────────────────
export interface SearchResult {
  title: string;
  content: string;
  url: string;
  source: "sogou" | "bilibili" | "weibo" | "openai" | "anthropic" | "jiqizhixin";
  sourceId?: string;
  publishedAt?: string; // ISO 8601 string
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  danmakuCount?: number;
  author?: {
    name: string;
    username: string;
  };
}

// ─── Aggregated account info ────────────────────────────────────────────────
export interface AccountInfo {
  platform: "bilibili" | "weibo";
  name: string;
  id: string;
  followers: number;
  verified: boolean;
  description: string;
  avatar?: string;
}
