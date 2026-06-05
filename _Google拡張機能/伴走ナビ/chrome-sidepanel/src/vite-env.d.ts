/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER: string;
  readonly VITE_AI_MODEL: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_GEMINI_MODEL: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
