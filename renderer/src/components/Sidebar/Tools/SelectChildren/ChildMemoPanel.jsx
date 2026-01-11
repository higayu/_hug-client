// src/components/Sidebar/ChildMemoPanel.jsx
import { useEffect, useState } from 'react'
import { useAppState } from '@/contexts/appState'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import { GlobeAltIcon } from "@heroicons/react/24/outline";

import {
  clickEnterButton,
  clickAbsenceButton,
  clickExitButton,
} from "@/utils/attendance/index.js";

import { useToast } from "@/components/common/ToastContext.jsx";

function ChildMemoPanel() {
  const {
    appState,
    attendanceData,
    setSelectedChildColumns,
    DEBUG_FLG,
  } = useAppState()

  const { addPersonalRecordTab, addProfessionalSupportNewTab,addWebManagerAction } = useTabs()


  const {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
  } = useToast();

  const IS_STOP = false;//停止を解除 !DEBUG_FLG // まだ不完全のため停止
  const SELECT_CHILD = appState.SELECT_CHILD

  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData
  } = useChildrenList()


  const [selectedChildData, setSelectedChildData] = useState(null)
  const [attendanceItem, setAttendanceItem] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)

  /* ===============================
   * 出欠データ解決
   * =============================== */
  useEffect(() => {
    if (!SELECT_CHILD) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      return
    }

    const list = attendanceData?.data
    if (!Array.isArray(list)) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      return
    }

    const item = list.find(
      i => String(i.children_id) === String(SELECT_CHILD)
    )

    setAttendanceItem(item || null)
    setIsUIEnabled(!!item)

    if (item) {
      setSelectedChildColumns({
        column5: item.column5 ?? null,
        column5Html: item.column5Html ?? null,
        column6: item.column6 ?? null,
        column6Html: item.column6Html ?? null
      })
    }
  }, [SELECT_CHILD, attendanceData, setSelectedChildColumns])

  /* ===============================
   * 子どもデータ解決
   * =============================== */
  useEffect(() => {
    if (!SELECT_CHILD) {
      setSelectedChildData(null)
      return
    }

    const child =
      childrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      waitingChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      experienceChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD))

    setSelectedChildData(child || null)
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData])

  /* ===============================
   * 未選択表示
   * =============================== */
  if (!SELECT_CHILD || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          要素を選択してください
        </div>
      </div>
    )
  }

  /* ===============================
   * UI判定
   * =============================== */
  const column5 = attendanceItem?.column5 ?? null
  const column5Html = attendanceItem?.column5Html ?? null
  const column6 = attendanceItem?.column6 ?? null
  const column6Html = attendanceItem?.column6Html ?? null

  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || '')

  // ★ 修正ポイント：欠席系をすべて拾う
  const isAbsent =
    typeof column5 === 'string' && column5.startsWith('欠席')

  const hasEntered = isTimeFormat(column5)
  const hasExited = isTimeFormat(column6)

  const disabledBtnClass = 'grayscale opacity-50 cursor-not-allowed'


  /* ===============================
  * 入室ボタン
  * =============================== */
  const nyushituButton = async (column5Html) => {
    const cid = SELECT_CHILD;
    console.group("🟦 入室クリック");

    if (!column5Html) {
      showErrorToast("入室情報が取得できません");
      console.groupEnd();
      return;
    }

    try {
      const res = await clickEnterButton(column5Html, Number(cid));
      if (res?.success === true) {
        showSuccessToast("入室　実行完了");
      } else {
        showErrorToast("入室　失敗");
      }
    } catch (e) {
      console.error("入室処理例外:", e);
      showErrorToast("入室　例外発生");
    } finally {
      console.groupEnd();
    }
  };

  /* ===============================
  * 退室ボタン
  * =============================== */
  const taishituButton = async (column6Html) => {
    const cid = SELECT_CHILD;
    console.group("🟥 退室クリック");

    if (!column6Html) {
      showErrorToast("退室情報が取得できません");
      console.groupEnd();
      return;
    }

    try {
      const res = await clickExitButton(column6Html, Number(cid));
      if (res?.success === true) {
        showSuccessToast("退室　実行完了");
      } else {
        showErrorToast("退室　失敗");
      }
    } catch (e) {
      console.error("退室処理例外:", e);
      showErrorToast("退室　例外発生");
    } finally {
      console.groupEnd();
    }
  };

  /* ===============================
  * 欠席ボタン
  * =============================== */
  const kessekiButton = async (column5Html) => {
    const cid = SELECT_CHILD;
    console.group("🟨 欠席クリック");

    if (!column5Html) {
      showErrorToast("欠席情報が取得できません");
      console.groupEnd();
      return;
    }

    try {
      const res = await clickAbsenceButton(column5Html, Number(cid));
      if (res?.success === true) {
        showSuccessToast("欠席　実行完了");
      } else {
        showErrorToast("欠席　失敗");
      }
    } catch (e) {
      console.error("欠席処理例外:", e);
      showErrorToast("欠席　例外発生");
    } finally {
      console.groupEnd();
    }
  };



  /* ===============================
   * Render
   * =============================== */
  return (
    <div className="child-memo-panel flex-1 min-h-0 border-l border-gray-300 bg-gray-50 flex flex-col">

      {/* スクロール領域 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        <div
          className={`flex flex-col rounded bg-gray-200 gap-2 p-2 ${
            !isUIEnabled ? 'opacity-60' : ''
          }`}
        >
          {isAbsent ? (
            <div className="text-xs font-bold text-red-600">
              {column5}
            </div>
          ) : hasEntered ? (
            <>
              <div>入室: {column5}</div>

              {hasExited && (
                <div>退室: {column6}</div>
              )}

              {!hasExited && (
                <button
                  className={`btn-green mt-2 ${
                    !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                  }`}
                  onClick={() => taishituButton(column6Html)}
                  disabled={!isUIEnabled || IS_STOP}
                >
                  退室
                </button>
              )}

              {hasExited && (
                <button
                  className={`btn-purple mt-2 p-2 ${
                    !isUIEnabled ? disabledBtnClass : ''
                  }`}
                  onClick={addProfessionalSupportNewTab}
                  disabled={!isUIEnabled}
                >
                  専門的支援
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className={`btn-blue p-2 w-[80px] ${
                  !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                }`}
                onClick={() => nyushituButton(column5Html)}
                disabled={!isUIEnabled || IS_STOP}
              >
                入室
              </button>

              <button
                className={`btn-red mt-2 p-2 w-[80px] ${
                  !isUIEnabled || IS_STOP ? disabledBtnClass : ''
                }`}
                onClick={() => kessekiButton(column5Html)}
                disabled={!isUIEnabled || IS_STOP}
              >
                欠席
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            id="professional-support-new"
            onClick={addWebManagerAction}
            title="Webページを開く"
            aria-label="Webページを開く"
            className="
              flex items-center justify-center
              bg-blue-300 rounded
              text-black
              px-3 py-2
              cursor-pointer
              transition-all
              hover:bg-[#e3f2fd]
            "
          >
            <GlobeAltIcon className="h-5 w-5" />
          </button>

          <button 
            id="kojin-kiroku"
            onClick={addPersonalRecordTab}
            className="
              flex items-center justify-center
              bg-[#4CAF50] text-white
              px-3 py-2
              rounded-lg font-bold
              cursor-pointer transition-all whitespace-nowrap
              hover:bg-[#66BB6A] hover:scale-105
              active:bg-[#43A047] active:scale-[0.97]
            "
          >
            個人記録
          </button>
        </div>


      </div>
    </div>
  )
}

export default ChildMemoPanel
