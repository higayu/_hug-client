// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PersonalRecordPrompt.jsx
import React, { useState, useEffect } from "react";
import { getActiveWebview } from '@/utils/webviewState.js'
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
import { sendPromptToChatGPT } from "./send/sendPromptToChatGPT";

import { useToast } from '@/components/common/ToastContext.jsx'
import { useDispatch, useSelector } from 'react-redux'
import {
  setAiText,
  sendStart,
  sendSuccess,
  sendError
} from '@/store/slices/sendTextSlice'
import PersonalInjectButton from './PersonalInput/PersonalInjectButton';
import RecordProceedingsDraftSaveButton from './PersonalInput/RecordProceedingsDraftSaveButton';
import MemoInputBox from './MemoInputBox';

export default function PersonalRecordPrompt() {
  const { appState, PROMPTS,DEBUG_FLG } = useAppState();

  // "personalRecord" と "professional" のプロンプトを2つの textarea に対応
  const [text1, setText1] = useState("");
  const dispatch = useDispatch()
  const PROMPT_KEY = 'personalRecord'
  const aiText = useSelector(
    state => state.sendText[PROMPT_KEY].aiText
  )
  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  } = useToast()

  const CHATGPT_DOMAINS = [
    "chatgpt.com",
    "chat.openai.com",
    "auth.openai.com",
    "platform.openai.com",
  ];

  const isChatGPT = (url = "") => {
    if (typeof url !== "string" || url.length < 5) return false;
    return CHATGPT_DOMAINS.some(domain => url.includes(domain));
  };



  // 🔥 初期化時ログ & 初期値セット
  useEffect(() => {
    console.log("🟦 PromptBox 初期化（マウント）");
    console.log(" appState:", appState);
    console.log(" PROMPTS:", PROMPTS);

    // プロンプトの初期値反映
    if (PROMPTS) {
      setText1(PROMPTS.personalRecord?.content ?? "");
    }
  }, []);

  const clickEnterButton = async () => {
    const textValue = `${text1}\n\n${aiText}`;

    if (!aiText || aiText.trim() === "") {
      showWarningToast("送信するテキストが空です");
      return;
    }

    dispatch(sendStart({ key: PROMPT_KEY }));
    showInfoToast("ChatGPT に送信中…");

    try {
      const success = await sendPromptToChatGPT({ textValue });

      if (!success) {
        throw new Error("sendPromptToChatGPT returned false");
      }

      dispatch(sendSuccess({ key: PROMPT_KEY }));
      showSuccessToast("ChatGPT に送信しました");
    } catch (error) {
      console.error("送信エラー:", error);

      dispatch(
        sendError({
          key: PROMPT_KEY,
          error: error?.message ?? "送信に失敗しました",
        })
      );

      showErrorToast("ChatGPT への送信に失敗しました");
    }
  };


  return (
    <div className="flex flex-col gap-2 p-3 w-full">

      {/* --- AI入力 --- */}
      <div className="mt-1">
        <label className="font-semibold">個人記録用プロンプト</label>
        <textarea
          className="w-full h-20 border bg-gray-900 text-white border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={text1}
          readOnly
        />
      </div>

      {/* ===== Textarea 1 ===== */}
      <div className="flex flex-col gap-1">
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-40 p-2 border bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="AIに送信する内容を入力..."
          value={aiText}
          onChange={(e) =>
            dispatch(
              setAiText({
                key: PROMPT_KEY,
                text: e.target.value,
              })
            )
          }
        />

        <div className="flex flex-row justify-between items-center">
          <button
            className="w-full bg-green-500 hover:bg-green-600 p-2 rounded text-white"
            onClick={() => clickEnterButton()}
          >
            実行
          </button>

          {DEBUG_FLG && (
          <div className="flex flex-col justify-end">
            <RecordProceedingsDraftSaveButton />
            <PersonalInjectButton />
          </div>
          )}
        </div>

        <MemoInputBox
              memoType={1}
              label="一時メモ１（編集可能）"
              minHeight={200}
          />

      </div>
    </div>
  );
}
