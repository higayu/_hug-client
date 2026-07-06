// renderer/src/components/Sidebar/TabsContainer/SelectChildren/AiContents/GeminiContent/PromptBox/ProfessionalPrompt1.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useAppState } from "@/AppStateContext";
import ProfessionalPlan from "@/components/common/hug_function/ProfessionalPlan";
import ProfessionalSupportCheckPanel2 from "@/components/common/hug_function/ProfessionalSupportCheckPanel2";

const DBG = "ProfessionalPrompt1";

export default function ProfessionalPrompt1({
  sendPrompt,
  aiName = "Gemini",
  promptKey = "professional1",
  renderOpenRouterResultArea,
}) {
  const appState = useAppState();

  const {
    PROMPTS,
    SELECT_CHILD,

    // loadDataBase() が AppState に保存したデータを読む
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
  } = appState;

  const [text1, setText1] = useState("");
  const [aiText, setAiText] = useState("");
  const [dbNote, setDbNote] = useState("");

  // =============================================================
  // appState.SELECT_CHILD 監視用
  // =============================================================
  useEffect(() => {
    console.log(`[${DBG}:appState.SELECT_CHILD] 変更検知`, {
      SELECT_CHILD: appState.SELECT_CHILD,
      type: typeof appState.SELECT_CHILD,
      appState,
    });
  }, [appState.SELECT_CHILD]);

  // =============================================================
  // appState.databaseState.children を安全に取得
  // =============================================================
  const databaseChildren = useMemo(
    () =>
      Array.isArray(appState?.databaseState?.children)
        ? appState.databaseState.children
        : [],
    [appState?.databaseState?.children]
  );

  // =============================================================
  // 既存AppState のデータも安全に配列化
  // =============================================================
  const weekChildrenData = useMemo(
    () => (Array.isArray(childrenData) ? childrenData : []),
    [childrenData]
  );

  const waitingChildrenData = useMemo(
    () =>
      Array.isArray(waiting_childrenData)
        ? waiting_childrenData
        : [],
    [waiting_childrenData]
  );

  const experienceChildrenData = useMemo(
    () =>
      Array.isArray(Experience_childrenData)
        ? Experience_childrenData
        : [],
    [Experience_childrenData]
  );

  const logDbg = (field, msg, extra = {}) => {
    console.log(`[${DBG}:${field}]`, msg, {
      SELECT_CHILD,
      appState_SELECT_CHILD: appState.SELECT_CHILD,
      aiName,
      promptKey,
      aiTextLen: aiText.length,
      dbNoteLen: dbNote.length,
      ...extra,
    });
  };

  // =============================================================
  // SELECT_CHILD 変更 → databaseState.children の id と照合して notes を dbNote にセット
  // =============================================================
  useEffect(() => {
    if (!SELECT_CHILD) {
      logDbg("dbNote", "SELECT_CHILD なし → dbNote クリア");
      setDbNote("");
      return;
    }

    const selectedId = String(SELECT_CHILD);

    console.log(`[${DBG}:児童データ] databaseState.children`, {
      selectedId,
      count: databaseChildren.length,
      databaseChildren,
    });

    const childFromDatabase = databaseChildren.find(
      (child) => String(child.id ?? child.children_id) === selectedId
    );

    // fallback: 既存の childrenData 系も一応見る
    const childFromOldState =
      weekChildrenData.find(
        (child) =>
          String(child.id ?? child.children_id) === selectedId
      ) ||
      waitingChildrenData.find(
        (child) =>
          String(child.id ?? child.children_id) === selectedId
      ) ||
      experienceChildrenData.find(
        (child) =>
          String(child.id ?? child.children_id) === selectedId
      ) ||
      null;

    const child = childFromDatabase || childFromOldState || null;
    const next = child?.notes ?? "";

    console.log(`[${DBG}:dbNote] SELECT_CHILD一致児童`, {
      selectedId,
      found: Boolean(child),
      source: childFromDatabase
        ? "databaseState.children"
        : childFromOldState
          ? "childrenData/waiting/experience"
          : "not_found",
      childId: child?.id ?? child?.children_id ?? null,
      childName: child?.name ?? null,
      notesLength: typeof next === "string" ? next.length : 0,
      notes: next,
      databaseChildrenCount: databaseChildren.length,
      weekChildrenCount: weekChildrenData.length,
      waitingChildrenCount: waitingChildrenData.length,
      experienceChildrenCount: experienceChildrenData.length,
    });

    setDbNote(next);
  }, [
    SELECT_CHILD,
    databaseChildren,
    weekChildrenData,
    waitingChildrenData,
    experienceChildrenData,
  ]);

  // =============================================================
  // 初期値セット
  // =============================================================
  useEffect(() => {
    const next =
      PROMPTS?.[promptKey]?.content ??
      PROMPTS?.professional1?.content ??
      "";

    logDbg("promptText1", "PROMPTS から text1 反映", {
      promptKey,
      nextLength: next.length,
    });

    setText1(next);
  }, [PROMPTS, promptKey]);

  // =============================================================
  // 送信する文字列
  // =============================================================
  const textValue = `${dbNote}\n\n\n${text1}\n\n\n${aiText}`;

  const clickEnterButton = async () => {
    if (!aiText || aiText.trim() === "") {
      return;
    }

    await sendPrompt({
      textValue,
      promptKey,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-full">
      {/* --- SELECT_CHILD 監視表示 --- */}
      <div className="text-xs bg-yellow-100 text-yellow-900 border border-yellow-300 rounded p-2">
        appState.SELECT_CHILD:{" "}
        <span className="font-bold">
          {appState.SELECT_CHILD ?? "未選択"}
        </span>
      </div>

      {/* --- DB保存済みメモ --- */}
      <div className="mt-4">
        <div className="flex flex-row justify-between items-center">
          <h4 className="text-xs font-bold text-gray-700 mb-2">
            保存済みメモ（専門支援内容 / DB）
          </h4>

          <ProfessionalPlan />
        </div>

        <div className="text-xs bg-gray-700 text-white p-2 rounded whitespace-pre-wrap">
          {dbNote || "メモがありません"}
        </div>
      </div>

      {/* --- プロンプト --- */}
      <div>
        <label className="font-semibold">
          専門的支援加算用プロンプト1
        </label>

        <textarea
          className="w-full h-20 bg-gray-900 text-white rounded p-2"
          value={text1}
          readOnly
          onFocus={(e) =>
            logDbg("promptText1", "focus（readOnly: 仕様上ここでは編集不可）", {
              readOnly: e.target.readOnly,
              valueLength: e.target.value?.length ?? 0,
            })
          }
          onKeyDown={(e) =>
            logDbg("promptText1", "keydown", {
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
            logDbg("aiText", "focus", {
              readOnly: e.target.readOnly,
              disabled: e.target.disabled,
              valueLength: e.target.value?.length ?? 0,
              activeElementIsSelf: document.activeElement === e.target,
            })
          }
          onBlur={() => logDbg("aiText", "blur")}
          onKeyDown={(e) =>
            logDbg("aiText", "keydown", {
              key: e.key,
              code: e.code,
              defaultPrevented: e.defaultPrevented,
              isComposing: e.nativeEvent?.isComposing,
            })
          }
          onBeforeInput={(e) =>
            logDbg("aiText", "beforeinput", {
              inputType: e.inputType,
              data: e.data,
              defaultPrevented: e.defaultPrevented,
            })
          }
          onCompositionStart={() =>
            logDbg("aiText", "compositionstart")
          }
          onCompositionEnd={(e) =>
            logDbg("aiText", "compositionend", {
              data: e.data,
            })
          }
          onChange={(e) => {
            const next = e.target.value;

            logDbg("aiText", "onChange", {
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
            type="button"
            className="w-[70%] bg-green-500 hover:bg-green-600 p-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={clickEnterButton}
            disabled={!aiText || aiText.trim() === ""}
          >
            {aiName}実行
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

        {(aiName === "OpenRouter" ||
          aiName === "Ollama" ||
          aiName === "Gemini") &&
          renderOpenRouterResultArea?.({
            promptKey,
            label: `${aiName} API 返却値（専門1）`,
          })}
      </div>
    </div>
  );
}