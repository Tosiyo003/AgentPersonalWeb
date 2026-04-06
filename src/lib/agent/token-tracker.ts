import type { TokenUsage, RunUsage } from "./types";

// DeepSeek V3 pricing (per million tokens, approximate)
// Input: $0.27 / Output: $1.10
const INPUT_COST_PER_M = 0.27;
const OUTPUT_COST_PER_M = 1.10;

export class TokenTracker {
  private totalInput = 0;
  private totalOutput = 0;

  add(usage: TokenUsage) {
    this.totalInput += usage.inputTokens;
    this.totalOutput += usage.outputTokens;
  }

  summarize(): RunUsage {
    const estimatedCostUSD =
      (this.totalInput / 1_000_000) * INPUT_COST_PER_M +
      (this.totalOutput / 1_000_000) * OUTPUT_COST_PER_M;

    return {
      totalInputTokens: this.totalInput,
      totalOutputTokens: this.totalOutput,
      estimatedCostUSD: Math.round(estimatedCostUSD * 100000) / 100000,
    };
  }
}
