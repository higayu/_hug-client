// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/PersonalRecordPrompt.jsx
import React, { useState, useEffect } from "react";
import { getActiveWebview } from '@/utils/webview/webviewState.js'
import { useAppState } from '@/AppStateContext';

import { useToast } from '@/components/common/ToastContext.jsx'
import { useDispatch, useSelector } from 'react-redux'
import {
  setAiText,
  sendStart,
  sendSuccess,
  sendError
} from '@/store/slices/sendTextSlice'
import MemoInputBox from './MemoInputBox';
import TabPanel from '@/components/Sidebar/common/TabPanel';
import PersonalRecordManagerPanel from '@/components/common/PersonalRecordManagerPanel';

const DBG = 'PersonalRecordPrompt';

export default function PersonalRecordPrompt({
  sendPrompt,
  aiName = "OpenRouter",
  promptKey = "personal",
  renderOpenRouterResultArea,
}) {
  const { appState, PROMPTS, DEBUG_FLG } = useAppState();
  // "personalRecord" と "professional" のプロンプトを2つの textarea に対応
  const [text1, setText1] = useState("");
  const dispatch = useDispatch()
  const PROMPT_KEY = 'personalRecord'
  const aiText = useSelector(
    state => state.sendText[PROMPT_KEY].aiText
  )
  const sending = useSelector(
    state => state.sendText[PROMPT_KEY].sending
  )
  const {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
  } = useToast()


  const logDbg = (field, msg, extra = {}) => {
    console.log(`[${DBG}:${field}]`, msg, {
      PROMPT_KEY,
      aiTextLen: typeof aiText === 'string' ? aiText.length : -1,
      ...extra,
    });
  };

  // 🔥 初期化時ログ & 初期値セット
  useEffect(() => {
    const next = PROMPTS?.personalRecord?.content ?? "";
    logDbg('promptText1', 'PROMPTS から text1 反映', { nextLength: next.length });
    setText1(next);
  }, [PROMPTS?.personalRecord?.content]);

  const clickEnterButton = async () => {
    if (!aiText || aiText.trim() === "") return;
    if (sending) return;

    const textValue = `${text1}\n\n${aiText}`;

    dispatch(sendStart({ key: PROMPT_KEY }));
    showInfoToast(`${aiName} に送信中…`);

    try {
      const success = await sendPrompt({ textValue, promptKey });

      if (!success) {
        throw new Error("sendPromptToOpenRouter returned false");
      }

      dispatch(sendSuccess({ key: PROMPT_KEY }));
      showSuccessToast(`${aiName} に送信しました`);
    } catch (error) {
      console.error("送信エラー:", error);

      dispatch(
        sendError({
          key: PROMPT_KEY,
          error: error?.message ?? "送信に失敗しました",
        })
      );

      showErrorToast(`${aiName} への送信に失敗しました`);
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
          onFocus={(e) =>
            logDbg('promptText1', 'focus（readOnly: 仕様上ここでは編集不可）', {
              readOnly: e.target.readOnly,
              valueLength: e.target.value?.length ?? 0,
            })
          }
          onKeyDown={(e) =>
            logDbg('promptText1', 'keydown', {
              key: e.key,
              defaultPrevented: e.defaultPrevented,
              isComposing: e.nativeEvent?.isComposing,
            })
          }
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
          onFocus={(e) =>
            logDbg('aiText', 'focus', {
              readOnly: e.target.readOnly,
              disabled: e.target.disabled,
              valueLength: e.target.value?.length ?? 0,
              activeElementIsSelf: document.activeElement === e.target,
            })
          }
          onBlur={() => logDbg('aiText', 'blur', {})}
          onKeyDown={(e) =>
            logDbg('aiText', 'keydown', {
              key: e.key,
              code: e.code,
              defaultPrevented: e.defaultPrevented,
              isComposing: e.nativeEvent?.isComposing,
            })
          }
          onBeforeInput={(e) =>
            logDbg('aiText', 'beforeinput', {
              inputType: e.inputType,
              data: e.data,
              defaultPrevented: e.defaultPrevented,
            })
          }
          onCompositionStart={() => logDbg('aiText', 'compositionstart', {})}
          onCompositionEnd={(e) =>
            logDbg('aiText', 'compositionend', { data: e.data })
          }
          onChange={(e) => {
            const next = e.target.value;
            logDbg('aiText', 'onChange', {
              prevLength: aiText.length,
              nextLength: next.length,
            });
            dispatch(
              setAiText({
                key: PROMPT_KEY,
                text: next,
              })
            );
          }}
        />

        <div className="flex flex-row justify-between items-center">
          <button
            className="w-full bg-green-500 hover:bg-green-600 p-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={clickEnterButton}
            disabled={!aiText || sending}
          >
            {sending ? "送信中…" : "OpenRouter実行"}
          </button>

        </div>

        {(aiName === "OpenRouter" || aiName === "Ollama") &&
          renderOpenRouterResultArea?.({
            promptKey,
            label: "OpenRouter API 返却値（個人）",
          })}

        <TabPanel tabs={["一時メモ", "記録"]} className="mt-2">
          <MemoInputBox
            memoType={1}
            label="一時メモ１（編集可能）"
            minHeight={200}
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <PersonalRecordManagerPanel />
          </div>
        </TabPanel>

      </div>
    </div>
  );
}
