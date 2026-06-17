import React, { useCallback, useState } from "react";
import { useAppState } from "@/contexts/appState";
import { useToast } from "@/components/common/ToastContext.jsx";
import PromptBox from "@/components/common/PromptBox";
import AccountInfoPanel from "@/components/common/AccountInfoPanel";
import { AI_PROMPT_COMPONENT_MAP } from "../promptComponentMap";
import { sendPromptToGemini } from "./send/sendPromptToGemini";

export default function GeminiContent() {
  const { appState } = useAppState();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
  const [latestResult, setLatestResult] = useState("");

  const sendPrompt = useCallback(
    async ({ textValue }) => {
      const apiKey = appState.GEMINI_API_KEY;
      const model = appState.GEMINI_MODEL || "gemini-3.5-flash";

      if (!apiKey) {
        showErrorToast("GEMINI_API_KEY が設定されていません");
        throw new Error("GEMINI_API_KEY is not configured");
      }

      showInfoToast("Gemini API に送信中…");

      try {
        const text = await sendPromptToGemini({ textValue, apiKey, model });
        setLatestResult(text);

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }

        showSuccessToast("Gemini API の応答を取得しました");
        return true;
      } catch (error) {
        console.error("[GeminiContent] send error:", error);
        showErrorToast("Gemini API の送信に失敗しました");
        throw error;
      }
    },
    [appState.GEMINI_API_KEY, appState.GEMINI_MODEL, showErrorToast, showInfoToast, showSuccessToast]
  );

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 space-y-3">
      <h2>Gemini-API</h2>
      <PromptBox
        componentMap={AI_PROMPT_COMPONENT_MAP}
        sendPrompt={sendPrompt}
        aiName="Gemini"
      />

      {latestResult && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-800">
          <div className="font-semibold text-gray-700 mb-1">Gemini API 応答</div>
          <pre className="whitespace-pre-wrap max-h-64 overflow-auto">{latestResult}</pre>
        </div>
      )}

      <AccountInfoPanel
        title="Gemini API 設定"
        items={[
          { label: "API KEY", value: appState.GEMINI_API_KEY },
          { label: "MODEL", value: appState.GEMINI_MODEL || "gemini-3.5-flash" },
        ]}
      />
    </div>
  );
}
