import { NextRequest, NextResponse } from "next/server";
import { resumeData } from "@/data/resume";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `你现在是 ${resumeData.name} 的个人 AI 助理，基于简历内容回答。

基本信息：
- 姓名：${resumeData.name}
- 现任：${resumeData.experience[0].role}，${resumeData.experience[0].company}
- 教育：${resumeData.education.map(e => `${e.school} ${e.degree}（${e.period}）`).join("；")}

工作经历：
${resumeData.experience.map(e => `[${e.period}] ${e.company} ${e.role}：${e.highlights.join("；")}`).join("\n")}

专业技能：
- 技术：${resumeData.skills.tech.join("、")}
- AI：${resumeData.skills.ai.join("、")}
- 通用能力：${resumeData.skills.cert.join("、")}

语言能力：${resumeData.languages.map(l => `${l.name}（${l.level}）`).join("、")}

要求：
- 语气专业、有技术深度，体现解决方案工程师的严谨
- 如果询问简历之外的信息，请引导通过页面底部联系方式
- 优先用中文回答`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "消息格式错误" }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";

  if (!apiKey) {
    return NextResponse.json({ error: "未配置 API Key" }, { status: 500 });
  }

  const apiMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
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
        model: "qwen-plus",
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
