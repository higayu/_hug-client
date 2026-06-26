// renderer/src/components/Sidebar/Tools/MemoTool/Parts/AiContents/common/ProfessionalPrompt1.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAppState } from "@/contexts/appState";
import { useChildrenList } from "@/hooks/useChildrenList.js";
import { sendPromptToOllama } from "./send/sendPromptToOllama";
import ProfessionalPlan from "@/components/common/PageRequestGet/ProfessionalPlan.jsx";
import ProfessionalSupportCheckPanel2 from "@/components/common/ProfessionalSupportCheckPanel2";

const DBG = 'ProfessionalPrompt1';

export default function ProfessionalPrompt1({
  sendPrompt = sendPromptToOllama,
  aiName = "Ollama",
  promptKey = "professional1",
  renderOllamaResultArea,
}) {
  const { appState, PROMPTS, SELECT_CHILD } = useAppState();
  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
    loadChildren,
  } = useChildrenList();

  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");
  const [dbNote, setDbNote] = useState("");

  const logDbg = (field, msg, extra = {}) => {
    console.log(`[${DBG}:${field}]`, msg, {
      SELECT_CHILD,
      aiTextLen: aiText.length,
      dbNoteLen: dbNote.length,
      ...extra,
    });
  };

  // 🔍 SELECT_CHILD 変更 → DBメモ読み込み
  useEffect(() => {
    if (!SELECT_CHILD) {
      logDbg('dbNote', 'useEffect: SELECT_CHILD なし → dbNote クリア', {});
      setDbNote("");
      return;
    }

    const child =
      childrenData.find(c => c.children_id === SELECT_CHILD) ||
      waitingChildrenData.find(c => c.children_id === SELECT_CHILD) ||
      experienceChildrenData.find(c => c.children_id === SELECT_CHILD);

    const next = child?.notes || "";
    logDbg('dbNote', 'useEffect: 一覧からメモ反映', {
      found: !!child,
      nextLength: next.length,
    });
    setDbNote(next);
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData]);

  // 🔥 初期値セット
  useEffect(() => {
    const next = PROMPTS?.professional1?.content ?? "";
    logDbg('promptText1', 'PROMPTS から text1 反映', { nextLength: next.length });
    setText1(next);
  }, [PROMPTS?.professional1?.content]);

  // ★ 送信する文字列を組み立てるだけ
  const textValue = `${dbNote}\n\n\n${text1}\n\n\n${aiText}`;

  const clickEnterButton = async () => {
    if (!aiText || aiText.trim() === "") return;

    await sendPrompt({ textValue, promptKey });
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-xs font-bold text-gray-700 mb-2">
            保存済みメモ（専門支援内容 / DB）
          </h4>
          <ProfessionalPlan
            onFetched={setDbNote}
            reloadChildren={loadChildren}
          />
        </div>

        <div className="text-xs bg-gray-700 text-white p-2 rounded whitespace-pre-wrap">
          {dbNote || "メモがありません"}
        </div>
      </div>

      {/* --- プロンプト --- */}
      <div>
        <label className="font-semibold">専門的支援加算用プロンプト1</label>
        <textarea
          className="w-full h-20 bg-gray-900 text-white rounded p-2"
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
            })
          }
        />
      </div>

      {/* --- AI入力 --- */}
      <div>
        <label className="font-bold text-gray-700 block mb-1">
          AIに送信するテキスト
        </label>
        <textarea
          className="w-full h-40 bg-gray-700 text-white rounded p-2"
          value={aiText}
          placeholder="AIに送信する内容を入力..."
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
            setAiText(next);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-start gap-2">
          <button
            className="w-[70%] bg-green-500 hover:bg-green-600 p-2 rounded text-white"
            onClick={clickEnterButton}
            disabled={!aiText}
          >
            Ollama実行
          </button>
          <div className="w-[30%]">
            <ProfessionalSupportCheckPanel2
              logTag="ProfessionalPrompt1"
              className="w-full"
              buttonClassName="w-full text-xs"
              labelClassName="w-full"
            />
          </div>
        </div>

        {(aiName === "Ollama" || aiName === "Gemini") &&
          renderOllamaResultArea?.({
            promptKey,
            label: "Ollama API 返却値（専門1）",
          })}
      </div>
    </div>
  );
}
