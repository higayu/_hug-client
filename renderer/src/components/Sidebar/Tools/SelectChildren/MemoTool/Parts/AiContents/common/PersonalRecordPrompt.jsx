// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PromptBox.jsx
import React, { useState, useEffect } from "react";
import { getActiveWebview } from '@/utils/webviewState.js'
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';

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

export default function PersonalRecordPrompt() {
  const { appState, PROMPTS } = useAppState();

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
    console.log("① clickEnterButton 開始");

    const vw = getActiveWebview();
    console.log("② getActiveWebview() の結果:", vw);

    // ▼ webviewが取得できない原因調査ログ
    if (!vw) {
      console.warn("❌ webview が取得できません (vw === null)");
      console.warn(" 可能性:");
      console.warn(" - webview がまだ mount されていない");
      console.warn(" - タブ切り替え直後で active が決まっていない");
      console.warn(" - getActiveWebview の管理がずれている");
      return;
    }

    // ▼ getURL メソッド存在チェック
    console.log("③ typeof vw.getURL:", typeof vw.getURL);

    const url =
      vw && typeof vw.getURL === "function" ? vw.getURL() : null;

    console.log("④ getURL() の返値:", url);

    // ▼ URL未取得の原因を細かく切り分け
    if (url === null) {
      console.warn("❌ getURL が取得できません (null)");
      console.warn("原因の可能性:");
      console.warn(" - vw.getURL が存在しない");
      console.warn(" - webview の初期化がまだ");
      console.warn(" - DOMReady 前の呼び出し");
      return;
    }

    if (url === "") {
      console.warn("❌ getURL が空文字 ('')");
      console.warn("原因の可能性:");
      console.warn(" - webview 読み込みがまだ開始されていない");
      console.warn(" - 直前に Fileスキームや Blank に遷移している");
      console.warn(" - リダイレクト途中");
      console.warn(" - did-stop-loading 前");
    }

    // ▼ ChatGPT 判定前のログ
    console.log("⑤ isChatGPT(url) 判定開始");
    console.log("  url:", url);

    const result = isChatGPT(url);
    console.log("⑥ isChatGPT 判定結果:", result);

    if (!result) {
      console.warn("❌ ChatGPT のドメイン判定 false");

      // ▼ 原因分類ログ
      if (url.length === 0)
        console.warn("原因: URL が空 → 読み込み前/リダイレクト中の可能性");
      else if (!url.includes("chat"))
        console.warn("原因: chatgpt/openai に関連しない URL");
      else
        console.warn("原因: ChatGPT 以外の openai ドメイン");

      console.warn("詳細 URL:", url);

      return;
    }

    console.log("⑦ ChatGPT ドメイン確認 OK");

    console.log("⑧ webview isLoading:", vw.isLoading?.());

    // --- ここから下はあなたの injection 処理 ---
    const TextValue = `${text1}\n\n${aiText}`;

    console.log("⑨ 注入テキスト:", TextValue);

    console.log("⑩ executeJavaScript 開始");
    try {
      const result = await vw.executeJavaScript("true");
      console.log("⑪ executeJavaScript 完了:", result);
    } catch (e) {
      console.error("❌ executeJavaScript 例外:", e);
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
            className="w-[250px] bg-green-500 hover:bg-green-600 p-2 rounded text-white"
            onClick={() => clickEnterButton()}
          >
            実行
          </button>

          <div className="flex flex-col justify-end">
            <RecordProceedingsDraftSaveButton />
            <PersonalInjectButton />
          </div>
        </div>

      </div>
    </div>
  );
}
