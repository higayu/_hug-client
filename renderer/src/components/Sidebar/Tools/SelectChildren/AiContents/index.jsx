// ./Parts/AiContents/index.jsx
import React from "react";
import { useAppState } from "@/contexts/appState";

import OpenAiContent from "./OpenAiContent";
import GeminiContent from "./GeminiContent";
import OllamaContent from "./OllamaContent";

const AI_COMPONENT_MAP = {
  gemini: GeminiContent,
  chatGPT: OpenAiContent,
  ollama: OllamaContent,
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
