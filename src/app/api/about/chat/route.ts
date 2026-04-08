import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");
const ABOUT_FILE = path.join(process.cwd(), "data", "about.json");

function readSettings(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function readAbout(): { education: { school: string; degree: string; period: string }[]; experience: { period: string; company: string; role: string; highlights: string[] }[] } {
  try {
    return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf-8"));
  } catch {
    return { education: [], experience: [] };
  }
}

function buildSystemPrompt(): string {
  const settings = readSettings();
  const about = readAbout();
  const { agentContext } = settings;

  const name = settings.name || "本人";
  const title = settings.title || "";
  const experience = about.experience || [];
  const education = about.education || [];

  // If agentContext is set, use it as the knowledge base
  if (agentContext && agentContext.trim()) {
    return `你是 ${name} 的个人 AI 助理，基于以下资料回答问题。

${agentContext.trim()}

要求：
- 语气专业、有技术深度
- 如果询问的资料不在以上内容中，请说明"这部分信息我暂时不了解，建议通过页面底部的联系方式直接询问"
- 优先用中文回答`;
  }

  // Fallback to dynamic data from settings/about.json
  const expBlock = experience.length > 0
    ? `\n工作经历：\n${experience.map((e) => `[${e.period}] ${e.company} ${e.role}：${e.highlights.join("；")}`).join("\n")}`
    : "";

  const eduBlock = education.length > 0
    ? `\n教育：${education.map((e) => `${e.school} ${e.degree}（${e.period}）`).join("；")}`
    : "";

  return `你现在是 ${name} 的个人 AI 助理，基于简历内容回答。

基本信息：
- 姓名：${name}
${title ? `- 现任：${title}` : ""}${eduBlock}${expBlock}

要求：
- 语气专业、有技术深度，体现解决方案工程师的严谨
- 如果询问简历之外的信息，请引导通过页面底部联系方式
- 优先用中文回答`;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "消息格式错误" }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const model = process.env.DASHSCOPE_MODEL ?? "qwen-plus";

  if (!apiKey) {
    return NextResponse.json({ error: "未配置 API Key" }, { status: 500 });
  }

  const apiMessages = [
    { role: "system" as const, content: buildSystemPrompt() },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `API 错误: ${errText.slice(0, 200)}` }, { status: 502 });
    }

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "服务异常" }, { status: 500 });
  }
}
