// ./Parts/AiContents/index.jsx
import React from "react";
import { useAppState } from "@/AppStateContext";

import OpenAiContent from "./OpenAiContent";
import GeminiContent from "./GeminiContent";
import OllamaContent from "./OllamaContent";
import DeepSeekContent from "./DeepSeekContent";
import OpenRouterContent from "./OpenRouterContent";

const AI_COMPONENT_MAP = {
  gemini: GeminiContent,
  chatGPT: OpenAiContent,
  ollama: OllamaContent,
  deepseek:DeepSeekContent,
  openrouter:OpenRouterContent,
};

export default function AiContents() {
  const { USE_AI } = useAppState();
  const AiComponent = AI_COMPONENT_MAP[USE_AI];

  if (!AiComponent) {
    return (
      <div className="text-sm text-gray-500 p-3">
        使用するAIが選択されていません
      </div>
    );
  }

  return <AiComponent />;
}
