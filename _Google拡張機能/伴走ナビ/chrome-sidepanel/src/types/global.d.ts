export interface AiConfig {
  AI_PROVIDER?: string;
  AI_MODEL?: string;
  OLLAMA_MODEL?: string;
  GEMINI_MODEL?: string;
  OLLAMA_BASE_URL?: string;
  GEMINI_API_KEY?: string;
  API_BASE?: string;
}

declare global {
  const chrome: {
    runtime?: {
      sendMessage: (
        message: unknown,
      ) => Promise<{ ok?: boolean; status?: number; body?: unknown; error?: string }>;
    };
  };
}

export {};
