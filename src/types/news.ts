export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string; // ISO 8601 string
  url: string;
  tags: string[];
}
