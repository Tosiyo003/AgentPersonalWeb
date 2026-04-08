"use client";

import { useState, useEffect } from "react";

function Hi({ children, c }: { children: React.ReactNode; c: string }) {
  return <span style={{ color: c, fontWeight: 500 }}>{children}</span>;
}

interface NarrativeData {
  text: string;
}

const COLOR_MAP: Record<string, string> = {
  "Transformer": "#3b82f6",
  "LLM": "#06b6d4",
  "ChatGPT": "#8b5cf6",
  "Prompt Engineering": "#3b82f6",
  "RAG": "#06b6d4",
  "Agent": "#8b5cf6",
  "MCP": "#3b82f6",
  "Skills": "#06b6d4",
  "Vibe Coding": "#8b5cf6",
  "Agentic Workflows": "#3b82f6",
};

function parseNarrative(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /([^（]+?)（([^）]+)）/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before this segment
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // The highlighted term and its parenthetical (rendered as one colored span)
    const term = match[1].trim();
    const paren = match[2].trim();
    const color = COLOR_MAP[term] ?? "rgba(255,255,255,0.55)";
    parts.push(
      <Hi key={key++} c={color}>
        {term}（{paren}）
      </Hi>
    );
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function NarrativeQuote() {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/narrative")
      .then((r) => r.json())
      .then((data: NarrativeData) => {
        setText(data.text ?? "");
      })
      .catch(() => {
        setText("");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !text) return null;

  const parsed = parseNarrative(text);

  return (
    <p
      className="text-sm leading-loose"
      style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-noto-sc)" }}
    >
      {parsed}
    </p>
  );
}
