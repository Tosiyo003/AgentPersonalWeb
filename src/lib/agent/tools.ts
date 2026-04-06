// OpenRouter tool definition for web_search
// Used as part of the tools array in the Claude API request

export const webSearchTool = {
  type: "function" as const,
  function: {
    name: "web_search",
    description:
      "Search the web for recent news and information. Use this to find the latest AI/LLM news.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query string",
        },
      },
      required: ["query"],
    },
  },
};
