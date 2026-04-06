import { NextRequest } from "next/server";
import { runNewsAgent } from "@/lib/agent/news-agent";
import type { AgentStatusEvent } from "@/lib/agent/types";

export const dynamic = "force-dynamic";

function requireAuth(req: NextRequest): boolean {
  return req.cookies.get("admin_session")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream Server-Sent Events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: AgentStatusEvent) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      try {
        const body = await req.json().catch(() => ({}));
        await runNewsAgent(send, body.config);
      } catch {
        // error event already sent by runNewsAgent
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
