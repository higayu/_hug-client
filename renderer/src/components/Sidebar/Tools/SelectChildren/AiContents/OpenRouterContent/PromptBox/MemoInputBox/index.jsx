// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/MemoInput/index.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useAppState } from "@/AppStateContext";
import { useNote } from "@/hooks/useNote.js";
import { addPersonalRecordTabAction3 } from "@/hooks/useTabs/actions/personalRecord.js";
import BrowserOpenButton from "@/components/common/BrowserOpenButton";

export default function MemoInputBox({
  memoType, // ← 1 or 2
  label,
  minHeight = 100,
}) {
  const ref = useRef(null);
  const loadSeqRef = useRef(0);
  const { showSuccessToast, showErrorToast } = useToast();
  const { appState, SELECT_CHILD } = useAppState();
  const { saveTemp1, saveTemp2, loadTemp } = useNote();
  const addPersonalRecordTab = useCallback(() => {
    addPersonalRecordTabAction3(appState);
  }, [appState]);

  const [value, setValue] = useState("");

  const log = (...args) => {
    console.log("[MemoInputBox]", { label, memoType, SELECT_CHILD }, ...args);
  };

  // 🔄 読み込み
  useEffect(() => {
    if (!SELECT_CHILD) {
      log("useEffect: SELECT_CHILD なし → value を空にリセット");
      setValue("");
      return;
    }

    const seq = ++loadSeqRef.current;
    log("useEffect: loadTemp 開始", {
      seq,
      loadTempRef: loadTemp?.name || String(loadTemp).slice(0, 40),
    });

    const proxy = {
      set value(v) {
        const branch =
          typeof v === "object" && v !== null ? "object(memo1/memo2)" : "primitive";
        const next =
          typeof v === "object" && v !== null
            ? memoType === 1
              ? v.memo1 || ""
              : v.memo2 || ""
            : v || "";
        log("proxy.value 適用（DBまたは空の反映）", {
          seq,
          branch,
          nextLength: next.length,
          memo1Len: v?.memo1?.length,
          memo2Len: v?.memo2?.length,
        });
        setValue(next);
      },
    };

    const p = loadTemp(SELECT_CHILD, proxy);
    if (p && typeof p.then === "function") {
      p.then(
        (ok) => {
          const stale = seq !== loadSeqRef.current;
          log("loadTemp Promise resolved", {
            seq,
            ok,
            activeSeq: loadSeqRef.current,
            stale,
          });
        },
        (err) => {
          console.error("[MemoInputBox] loadTemp Promise rejected", {
            label,
            memoType,
            seq,
            err,
          });
        }
      );
    }
  }, [SELECT_CHILD, loadTemp, memoType]);

  const handleSave = async () => {
    if (!SELECT_CHILD) return;

    try {
      const result =
        memoType === 1
          ? await saveTemp1(SELECT_CHILD, value)
          : await saveTemp2(SELECT_CHILD, value);

      if (result) {
        showSuccessToast(`${label} を保存しました`);
      } else {
        showErrorToast(`${label} の保存に失敗しました`);
      }
    } catch (e) {
      console.error(e);
      showErrorToast(`${label} の保存中にエラー`);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2 mt-1 mb-1 items-start">
        <label className="px-2 py-1 text-xs font-bold text-gray-700">
          {label}
        </label>
      </div>

      <textarea
        ref={ref}
        className="w-full p-2 border border-gray-300 rounded text-xs bg-white resize-y
                   text-black focus:outline-none focus:border-blue-600
                   focus:ring-2 focus:ring-blue-200"
        style={{ minHeight }}
        value={value}
        disabled={!SELECT_CHILD}
        onFocus={() => {
          log("textarea focus", {
            disabled: !SELECT_CHILD,
            valueLength: value.length,
            activeElementIsSelf: document.activeElement === ref.current,
          });
        }}
        onBlur={() => log("textarea blur")}
        onKeyDown={(e) => {
          log("textarea keydown", {
            key: e.key,
            code: e.code,
            defaultPrevented: e.defaultPrevented,
            isComposing: e.nativeEvent?.isComposing,
          });
        }}
        onBeforeInput={(e) => {
          log("textarea beforeinput", {
            inputType: e.inputType,
            data: e.data,
            defaultPrevented: e.defaultPrevented,
          });
        }}
        onCompositionStart={() => log("IME compositionstart")}
        onCompositionEnd={(e) => {
          log("IME compositionend", { data: e.data });
        }}
        onChange={(e) => {
          const next = e.target.value;
          log("textarea onChange", {
            prevLength: value.length,
            nextLength: next.length,
          });
          setValue(next);
        }}
      />

      <div className="mt-2 flex gap-2 items-stretch">
      {memoType === 1 && (
          <BrowserOpenButton
            switch_id={3}
            path={""}
            title= '児童の課題記録'
            disabled_flg={!SELECT_CHILD}
          />
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!SELECT_CHILD}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded
                     text-xs hover:bg-blue-700 disabled:opacity-50"
        >
          このメモを保存
        </button>
        {(memoType === 1 || memoType === 2) && (
          <button
            type="button"
            id="kojin-kiroku"
            onClick={addPersonalRecordTab}
            disabled={!SELECT_CHILD}
            className="
              flex items-center justify-center shrink-0
              bg-[#4CAF50] text-white
              px-3 py-2
              rounded-lg font-bold text-xs
              cursor-pointer transition-all whitespace-nowrap
              hover:bg-[#66BB6A] hover:scale-105
              active:bg-[#43A047] active:scale-[0.97]
              disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            個人記録
          </button>
        )}
      </div>
    </div>
  );
}
