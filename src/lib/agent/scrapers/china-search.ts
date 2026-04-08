import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";
import type { SearchResult, AccountInfo } from "./types";

// ─── User Agents ─────────────────────────────────────────────────────────────
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

// ─── Rate limiter ────────────────────────────────────────────────────────────
class RateLimiter {
  private lastRequestTime = 0;
  private minInterval: number;

  constructor(minIntervalMs = 3000) {
    this.minInterval = minIntervalMs;
  }

  async wait(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.minInterval) {
      await new Promise((resolve) => setTimeout(resolve, this.minInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }
}

const sogouLimiter = new RateLimiter(3000);
const bilibiliLimiter = new RateLimiter(2000);
const weiboLimiter = new RateLimiter(3000);
const officialLimiter = new RateLimiter(4000);

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Sogou search ────────────────────────────────────────────────────────────
export async function searchSogou(query: string): Promise<SearchResult[]> {
  await sogouLimiter.wait();

  try {
    const response = await axios.get("https://www.sogou.com/web", {
      params: { query, ie: "utf-8" },
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $(".vrwrap, .rb").each((_, element) => {
      const titleEl = $(element).find("h3 a, .vr-title a, .vrTitle a").first();
      const title = titleEl.text().trim();
      let url = titleEl.attr("href") || "";

      if (url.startsWith("/link?url=")) {
        url = `https://www.sogou.com${url}`;
      }

      const snippet =
        $(element).find(".space-txt, .str-text-info, .str_info, .text-layout").text().trim() ||
        $(element).find("p").first().text().trim();

      if (title && url && !title.includes("大家还在搜")) {
        results.push({
          title,
          content: snippet || title,
          url,
          source: "sogou",
        });
      }
    });

    console.log(`[scraper] Sogou "${query}": ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[scraper] Sogou error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Bilibili API types ───────────────────────────────────────────────────────
interface BilibiliSearchResponse {
  code: number;
  data?: { result?: BilibiliVideoResult[] };
}

interface BilibiliVideoResult {
  aid: number;
  bvid: string;
  title: string;
  description: string;
  author: string;
  mid: number;
  pic: string;
  play: number;
  favorites: number;
  review: number;
  danmaku: number;
  like: number;
  pubdate: number;
}

interface BilibiliUserSearchResponse {
  code: number;
  data?: { result?: BilibiliUserResult[] };
}

interface BilibiliUserResult {
  mid: number;
  uname: string;
  usign: string;
  fans: number;
  videos: number;
  upic: string;
  official_verify: { type: number; desc: string };
}

interface BilibiliSpaceResponse {
  code: number;
  data?: { list?: { vlist?: BilibiliSpaceVideo[] } };
}

interface BilibiliSpaceVideo {
  aid: number;
  bvid: string;
  title: string;
  description: string;
  author: string;
  mid: number;
  pic: string;
  play: number;
  favorites: number;
  review: number;
  comment: number;
  danmaku: number;
  created: number;
}

// ─── Bilibili video search ────────────────────────────────────────────────────
export async function searchBilibili(query: string): Promise<SearchResult[]> {
  await bilibiliLimiter.wait();

  try {
    const buvid3 = `${crypto.randomUUID()}infoc`;

    const response = await axios.get<BilibiliSearchResponse>(
      "https://api.bilibili.com/x/web-interface/search/type",
      {
        params: { keyword: query, search_type: "video", order: "pubdate", page: 1, pagesize: 20 },
        headers: {
          "User-Agent": getRandomUserAgent(),
          Referer: "https://search.bilibili.com/",
          Accept: "application/json",
          Cookie: `buvid3=${buvid3}`,
        },
        timeout: 15000,
      }
    );

    if (response.data.code !== 0 || !response.data.data?.result) {
      console.log(`[scraper] Bilibili: no results (code ${response.data.code})`);
      return [];
    }

    const results: SearchResult[] = response.data.data.result.map((video) => ({
      title: video.title.replace(/<\/?em[^>]*>/g, ""),
      content: video.description || video.title.replace(/<\/?em[^>]*>/g, ""),
      url: `https://www.bilibili.com/video/${video.bvid}`,
      source: "bilibili" as const,
      sourceId: video.bvid,
      publishedAt: new Date(video.pubdate * 1000).toISOString(),
      viewCount: video.play,
      likeCount: video.like,
      commentCount: video.review,
      danmakuCount: video.danmaku,
      author: { name: video.author, username: String(video.mid) },
    }));

    console.log(`[scraper] Bilibili "${query}": ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[scraper] Bilibili error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Bilibili user search ────────────────────────────────────────────────────
export async function searchBilibiliUser(keyword: string): Promise<BilibiliUserResult | null> {
  await bilibiliLimiter.wait();

  try {
    const response = await axios.get<BilibiliUserSearchResponse>(
      "https://api.bilibili.com/x/web-interface/search/type",
      {
        params: { keyword, search_type: "bili_user", page: 1, pagesize: 5 },
        headers: {
          "User-Agent": getRandomUserAgent(),
          Referer: "https://search.bilibili.com/",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data.code !== 0 || !response.data.data?.result?.length) return null;

    const exactMatch = response.data.data.result.find(
      (u) => u.uname === keyword || u.uname.toLowerCase() === keyword.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    const top = response.data.data.result[0];
    if (top.fans > 1000 && top.uname.includes(keyword)) return top;

    return null;
  } catch (error) {
    console.error("[scraper] Bilibili user error:", error instanceof Error ? error.message : error);
    return null;
  }
}

// ─── Get Bilibili user videos ─────────────────────────────────────────────────
export async function getBilibiliUserVideos(mid: number): Promise<SearchResult[]> {
  await bilibiliLimiter.wait();

  try {
    const response = await axios.get<BilibiliSpaceResponse>(
      "https://api.bilibili.com/x/space/arc/search",
      {
        params: { mid, pn: 1, ps: 10, order: "pubdate" },
        headers: {
          "User-Agent": getRandomUserAgent(),
          Referer: `https://space.bilibili.com/${mid}`,
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data.code !== 0 || !response.data.data?.list?.vlist) return [];

    return response.data.data.list.vlist.map((video) => ({
      title: video.title,
      content: video.description || video.title,
      url: `https://www.bilibili.com/video/${video.bvid}`,
      source: "bilibili" as const,
      sourceId: video.bvid,
      publishedAt: new Date(video.created * 1000).toISOString(),
      viewCount: video.play,
      commentCount: video.comment || video.review,
      danmakuCount: video.danmaku,
      author: { name: video.author, username: String(video.mid) },
    }));
  } catch (error) {
    console.error("[scraper] Bilibili videos error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Weibo hot search ─────────────────────────────────────────────────────────
interface WeiboHotItem {
  word: string;
  note?: string;
  num: number;
  category?: string;
  mid?: string;
}

export async function searchWeibo(query: string): Promise<SearchResult[]> {
  await weiboLimiter.wait();

  try {
    const response = await axios.get("https://weibo.com/ajax/side/hotSearch", {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "application/json",
        Referer: "https://weibo.com/",
      },
      timeout: 15000,
    });

    if (response.data?.ok !== 1 || !response.data?.data?.realtime) {
      console.log("[scraper] Weibo: no data");
      return [];
    }

    const hotItems: WeiboHotItem[] = response.data.data.realtime;
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);

    for (const item of hotItems) {
      const word = (item.note || item.word || "").toLowerCase();
      const isMatch =
        queryWords.some((qw) => word.includes(qw) || qw.includes(word)) ||
        word.includes(queryLower) ||
        queryLower.includes(word);

      if (isMatch) {
        const topicName = item.note || item.word;
        results.push({
          title: `微博热搜: ${topicName}`,
          content: `微博热搜话题「${topicName}」，热度 ${item.num?.toLocaleString() || "未知"}`,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent("#" + topicName + "#")}`,
          source: "weibo" as const,
          viewCount: item.num || 0,
        });
      }
    }

    console.log(`[scraper] Weibo "${query}": ${results.length} matches`);
    return results;
  } catch (error) {
    console.error("[scraper] Weibo error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Account detection ────────────────────────────────────────────────────────
export async function detectAndFetchAccount(keyword: string): Promise<{
  accounts: AccountInfo[];
  results: SearchResult[];
}> {
  const accounts: AccountInfo[] = [];
  const results: SearchResult[] = [];

  try {
    const biliUser = await searchBilibiliUser(keyword);
    if (biliUser) {
      accounts.push({
        platform: "bilibili",
        name: biliUser.uname,
        id: String(biliUser.mid),
        followers: biliUser.fans,
        verified: biliUser.official_verify?.type >= 0,
        description: biliUser.usign,
        avatar: biliUser.upic,
      });
      console.log(`[scraper] Detected Bilibili account: ${biliUser.uname} (${biliUser.fans} fans)`);
      const userVideos = await getBilibiliUserVideos(biliUser.mid);
      results.push(...userVideos);
    }
  } catch (error) {
    console.error("[scraper] Account detection error:", error instanceof Error ? error.message : error);
  }

  return { accounts, results };
}

// ─── OpenAI Blog ─────────────────────────────────────────────────────────────
export async function searchOpenAI(_query: string): Promise<SearchResult[]> {
  await officialLimiter.wait();

  try {
    const response = await axios.get("https://openai.com/news/", {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    // OpenAI news items are in articles with relative links
    $("article").each((_, el) => {
      const titleEl = $(el).find("h2, h3").first();
      const linkEl = $(el).find("a").first();
      const title = titleEl.text().trim();
      let url = linkEl.attr("href") || "";

      if (!title) return;

      // Resolve relative URLs
      if (url.startsWith("/")) url = `https://openai.com${url}`;
      else if (!url.startsWith("http")) url = `https://openai.com/news/${url}`;

      const dateText = $(el).find("time").text().trim();
      const summary = $(el).find("p").first().text().trim();

      results.push({
        title,
        content: summary || title,
        url,
        source: "openai",
        publishedAt: dateText ? new Date(dateText).toISOString() : undefined,
      });
    });

    console.log(`[scraper] OpenAI Blog: ${results.length} articles`);
    return results;
  } catch (error) {
    console.error("[scraper] OpenAI Blog error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Anthropic News ─────────────────────────────────────────────────────────
export async function searchAnthropic(_query: string): Promise<SearchResult[]> {
  await officialLimiter.wait();

  try {
    const response = await axios.get("https://www.anthropic.com/news", {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $("article, .news-item, .post").each((_, el) => {
      const titleEl = $(el).find("h2, h3, h4").first();
      const linkEl = $(el).find("a[href]").first();
      const title = titleEl.text().trim();
      let url = linkEl.attr("href") || "";

      if (!title || title.length < 5) return;

      if (url.startsWith("/")) url = `https://www.anthropic.com${url}`;
      else if (!url.startsWith("http")) url = `https://www.anthropic.com/news/${url}`;

      const dateText = $(el).find("time, .date").text().trim();
      const summary = $(el).find("p").first().text().trim();

      results.push({
        title,
        content: summary || title,
        url,
        source: "anthropic",
        publishedAt: dateText ? new Date(dateText).toISOString() : undefined,
      });
    });

    console.log(`[scraper] Anthropic News: ${results.length} articles`);
    return results;
  } catch (error) {
    console.error("[scraper] Anthropic News error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── 机器之心 (Jiqizhixin) via sogou site search ─────────────────────────────
export async function searchJiqizhixin(query: string): Promise<SearchResult[]> {
  await sogouLimiter.wait();

  try {
    const response = await axios.get("https://www.sogou.com/web", {
      params: {
        query: `${query} site:jiqizhixin.com`,
        ie: "utf-8",
      },
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $(".vrwrap, .rb").each((_, el) => {
      const titleEl = $(el).find("h3 a, .vr-title a").first();
      const title = titleEl.text().trim();
      let url = titleEl.attr("href") || "";

      if (url.startsWith("/link?url=")) {
        url = `https://www.sogou.com${url}`;
      }

      const snippet =
        $(el).find(".space-txt, .str-text-info, .str_info").text().trim() ||
        $(el).find("p").first().text().trim();

      if (title && url) {
        results.push({
          title,
          content: snippet || title,
          url,
          source: "jiqizhixin",
        });
      }
    });

    console.log(`[scraper] Jiqizhixin "${query}": ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[scraper] Jiqizhixin error:", error instanceof Error ? error.message : error);
    return [];
  }
}

// ─── Official sources aggregator ─────────────────────────────────────────────
export async function searchOfficialSources(query: string): Promise<SearchResult[]> {
  const results = await Promise.allSettled([
    searchOpenAI(query),
    searchAnthropic(query),
    searchJiqizhixin(query),
  ]);

  const allResults: SearchResult[] = [];
  const sourceNames = ["OpenAI", "Anthropic", "Jiqizhixin"];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
      console.log(`  ${sourceNames[index]}: ${result.value.length} results`);
    } else {
      console.warn(`  ${sourceNames[index]} failed:`, result.reason);
    }
  });

  return allResults;
}

// ─── Main aggregator ─────────────────────────────────────────────────────────
export async function searchAllChina(query: string): Promise<SearchResult[]> {
  const results = await Promise.allSettled([
    searchSogou(query),
    searchBilibili(query),
    searchWeibo(query),
    searchOpenAI(query),
    searchAnthropic(query),
    searchJiqizhixin(query),
  ]);

  const allResults: SearchResult[] = [];
  const sourceNames = ["Sogou", "Bilibili", "Weibo", "OpenAI", "Anthropic", "Jiqizhixin"];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allResults.push(...result.value);
      console.log(`  ${sourceNames[index]}: ${result.value.length} results`);
    } else {
      console.warn(`  ${sourceNames[index]} failed:`, result.reason);
    }
  });

  return allResults;
}
