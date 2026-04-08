export interface SearchResult {
  title: string;
  content: string;
  url: string;
  source: "sogou" | "bilibili" | "weibo";
  sourceId?: string;
  publishedAt?: string | Date;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  danmakuCount?: number;
  author?: {
    name: string;
    username: string;
  };
}
