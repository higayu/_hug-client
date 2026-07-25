import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useToast } from "@/components/common/ToastContext.jsx";
import { useAppState } from "@/AppStateContext";
import { useNote } from "@/hooks/useNote.js";
import { addPersonalRecordTabAction4 } from "@/hooks/useTabs/actions/personalRecord.js";
import BrowserOpenButton from "@/components/common/BrowserOpenButton";

export default function MemoInputBox({
  memoType,
  label,
  minHeight = 100,
}) {
  const textareaRef = useRef(null);

  // 最新の読込処理だけを有効にするための番号
  const loadSeqRef = useRef(0);

  // 入力中にDBの値で上書きされないようにする
  const editingRef = useRef(false);

  const { showSuccessToast, showErrorToast } = useToast();
  const { appState, SELECT_CHILD } = useAppState();
  const { saveTemp1, saveTemp2, loadTemp } = useNote();

  // loadTempの関数参照が変化しても
  // 読み込み用useEffectを再実行させない
  const loadTempRef = useRef(loadTemp);

  useEffect(() => {
    loadTempRef.current = loadTemp;
  }, [loadTemp]);

  const [value, setValue] = useState("");

  const log = useCallback(
    (...args) => {
      console.log(
        "[MemoInputBox]",
        {
          label,
          memoType,
          SELECT_CHILD,
        },
        ...args,
      );
    },
    [label, memoType, SELECT_CHILD],
  );

  const addPersonalRecordTab = useCallback(() => {
    addPersonalRecordTabAction4(appState);
  }, [appState]);

  /*
   * 児童またはメモ種別が変わったときだけ読み込む
   */
  useEffect(() => {
    editingRef.current = false;

    if (!SELECT_CHILD) {
      loadSeqRef.current += 1;
      setValue("");
      return;
    }

    const seq = ++loadSeqRef.current;

    const proxy = {
      set value(result) {
        // 古い非同期処理の結果は無視
        if (seq !== loadSeqRef.current) {
          log("古い読み込み結果を無視", {
            seq,
            activeSeq: loadSeqRef.current,
          });
          return;
        }

        // 読み込み中にユーザーが入力を始めた場合も無視
        if (editingRef.current) {
          log("入力中のため読み込み結果を無視", {
            seq,
          });
          return;
        }

        let nextValue = "";

        if (typeof result === "object" && result !== null) {
          nextValue =
            memoType === 1
              ? result.memo1 ?? ""
              : result.memo2 ?? "";
        } else {
          nextValue = result ?? "";
        }

        setValue(String(nextValue));
      },
    };

    async function loadMemo() {
      try {
        await loadTempRef.current(SELECT_CHILD, proxy);
      } catch (error) {
        if (seq !== loadSeqRef.current) {
          return;
        }

        console.error("[MemoInputBox] メモ読込エラー", {
          label,
          memoType,
          SELECT_CHILD,
          error,
        });

        showErrorToast(`${label} の読み込みに失敗しました`);
      }
    }

    loadMemo();

    return () => {
      // クリーンアップ後に返ってきた通信結果を無効化
      if (loadSeqRef.current === seq) {
        loadSeqRef.current += 1;
      }
    };
  }, [
    SELECT_CHILD,
    memoType,
    label,
    log,
    showErrorToast,
  ]);

  async function handleSave() {
    if (!SELECT_CHILD) {
      return;
    }

    try {
      const result =
        memoType === 1
          ? await saveTemp1(SELECT_CHILD, value)
          : await saveTemp2(SELECT_CHILD, value);

      if (!result) {
        showErrorToast(`${label} の保存に失敗しました`);
        return;
      }

      editingRef.current = false;
      showSuccessToast(`${label} を保存しました`);
    } catch (error) {
      console.error("[MemoInputBox] メモ保存エラー", error);
      showErrorToast(`${label} の保存中にエラーが発生しました`);
    }
  }

  function handleChange(event) {
    editingRef.current = true;
    setValue(event.target.value);
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2 mt-1 mb-1 items-start">
        <label
          htmlFor={`memo-input-${memoType}`}
          className="px-2 py-1 text-xs font-bold text-gray-700"
        >
          {label}
        </label>
      </div>

      <textarea
        id={`memo-input-${memoType}`}
        ref={textareaRef}
        className="
          w-full p-2 border border-gray-300 rounded text-xs
          bg-white resize-y text-black
          focus:outline-none focus:border-blue-600
          focus:ring-2 focus:ring-blue-200
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
        style={{ minHeight }}
        value={value}
        disabled={!SELECT_CHILD}
        onChange={handleChange}
        onCompositionStart={() => {
          editingRef.current = true;
        }}
        onKeyDown={(event) => {
          // 日本語変換中のEnterは保存操作などに使わない
          if (
            event.nativeEvent?.isComposing ||
            event.keyCode === 229
          ) {
            return;
          }
        }}
      />

      <div className="mt-2 flex gap-2 items-stretch">
        {memoType === 1 && (
          <BrowserOpenButton
            switch_id={3}
            path=""
            title="児童の課題記録"
            disabled_flg={!SELECT_CHILD}
          />
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!SELECT_CHILD}
          className="
            flex-1 px-3 py-2
            bg-blue-600 text-white rounded text-xs
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          このメモを保存
        </button>

        {(memoType === 1 || memoType === 2) && (
          <button
            type="button"
            id={`kojin-kiroku-${memoType}`}
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
              disabled:grayscale disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:scale-100
            "
          >
            個人記録
          </button>
        )}
      </div>
    </div>
  );
}