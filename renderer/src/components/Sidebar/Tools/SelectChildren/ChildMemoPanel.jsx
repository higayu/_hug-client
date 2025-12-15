// src/components/Sidebar/ChildMemoPanel.jsx
import { useEffect, useState } from 'react'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import MemoContainer from './MemoTool/MemoContainer.jsx'
import { clickEnterButton, clickAbsenceButton, clickExitButton } from '@/utils/attendanceButtonClick.js'

function ChildMemoPanel() {
  const { 
    appState,
    attendanceData,
    SELECTED_CHILD_COLUMN5,
    SELECTED_CHILD_COLUMN5_HTML,
    SELECTED_CHILD_COLUMN6,
    SELECTED_CHILD_COLUMN6_HTML,
    setSelectedChildColumns
  } = useAppState()

  const SELECT_CHILD = appState.SELECT_CHILD

  const { childrenData, waitingChildrenData, experienceChildrenData } = useChildrenList()
  const { addProfessionalSupportNewTab } = useTabs()

  const [selectedChildData, setSelectedChildData] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)

  useEffect(() => {
    console.group("📦 [ChildMemoPanel] Redux snapshot");
    console.log("attendanceData raw:", attendanceData);
    console.log("attendanceData keys:", attendanceData && Object.keys(attendanceData));
    console.log("SELECTED columns:", {
      c5: SELECTED_CHILD_COLUMN5,
      c5h: SELECTED_CHILD_COLUMN5_HTML,
      c6: SELECTED_CHILD_COLUMN6,
      c6h: SELECTED_CHILD_COLUMN6_HTML,
    });
    console.groupEnd();
  }, [attendanceData]);


  // store への column5/6 保存
  useEffect(() => {
    console.log("---- ChildMemoPanel: attendanceData 更新 ----")
    console.log("SELECT_CHILD:", SELECT_CHILD)
    console.log("attendanceData:", attendanceData)

    // データがない
    if (!SELECT_CHILD || !attendanceData?.data) {
      console.log("⚠ データなし → UI 無効")
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
      return
    }

    console.group("🧩 [ChildMemoPanel] attendance 判定");

    console.log("SELECT_CHILD:", SELECT_CHILD, typeof SELECT_CHILD);
    console.log("attendanceData:", attendanceData);
    console.log("attendanceData type:", typeof attendanceData);
    console.log("Array.isArray(attendanceData):", Array.isArray(attendanceData));
    console.log("attendanceData?.data:", attendanceData?.data);

    if (!SELECT_CHILD) {
      console.warn("❌ SELECT_CHILD が未設定");
      console.groupEnd();
      return;
    }
    console.log('👶 [ChildMemoPanel] SELECT_CHILD:', SELECT_CHILD)

    if (!attendanceData) {
      console.warn("❌ attendanceData が null / undefined");
      console.groupEnd();
      return;
    }

    // ★ ここで data / 直配列のどちらかを判定
    const list = Array.isArray(attendanceData)
      ? attendanceData
      : attendanceData?.data;

    console.log("attendance list 判定結果:", list);

    if (!Array.isArray(list)) {
      console.warn("❌ attendance list が配列ではない");
      console.groupEnd();
      return;
    }


    // const attendanceItem = attendanceData.data.find(
    //   item => item.children_id === String(SELECT_CHILD)
    // )
    const attendanceItem = list.find(
      item => String(item.children_id) === String(SELECT_CHILD)
    )


    console.log("attendanceItem:", attendanceItem)
    console.log("UI 有効？:", !!attendanceItem)

    setIsUIEnabled(!!attendanceItem)

    if (attendanceItem) {
      setSelectedChildColumns({
        column5: attendanceItem.column5 || null,
        column5Html: attendanceItem.column5Html || null,
        column6: attendanceItem.column6 || null,
        column6Html: attendanceItem.column6Html || null
      })
    } else {
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null
      })
    }
  }, [SELECT_CHILD, attendanceData, setSelectedChildColumns])

  // 子どもデータの取得
  useEffect(() => {
    console.group("👶 [ChildMemoPanel] 選択児童解決");

    console.log("SELECT_CHILD:", SELECT_CHILD, typeof SELECT_CHILD);
    console.log("childrenData:", childrenData);
    console.log("waitingChildrenData:", waitingChildrenData);
    console.log("experienceChildrenData:", experienceChildrenData);

    if (!SELECT_CHILD) {
      console.warn("❌ SELECT_CHILD 未設定");
      setSelectedChildData(null);
      console.groupEnd();
      return;
    }

    const child =
      childrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      waitingChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD)) ||
      experienceChildrenData.find(c => String(c.children_id) === String(SELECT_CHILD));

    console.log("resolved child:", child);

    setSelectedChildData(child || null);
    console.groupEnd();
  }, [SELECT_CHILD, childrenData, waitingChildrenData, experienceChildrenData]);

  // 表示されていない場合
  if (!SELECT_CHILD || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          要素を選択してください
        </div>
      </div>
    )
  }

  const column5 = SELECTED_CHILD_COLUMN5
  const column5Html = SELECTED_CHILD_COLUMN5_HTML
  const column6 = SELECTED_CHILD_COLUMN6
  const column6Html = SELECTED_CHILD_COLUMN6_HTML

  const isTimeFormat = (value) => /^\d{2}:\d{2}$/.test(value || "")
  const hasBothEnterAndAbsent = (value) => {
    const v = (value || "").replace(/\s+/g, " ")
    return v.includes("入室") && v.includes("欠席")
  }

  return (
    <div className="child-memo-panel flex-1 border-l border-gray-300 bg-gray-50 overflow-y-auto flex flex-col h-full">

      {/* 子ども情報 */}
      <div className="bg-white text-center rounded p-2 mb-2">
        <h3 className="text-sm font-bold text-gray-700 m-2">
          {selectedChildData.children_id}: {selectedChildData.children_name}
        </h3>
        {selectedChildData.pc_name && (
          <p className="text-xs text-gray-600 mb-2">
            PC名: {selectedChildData.pc_name}
          </p>
        )}
      </div>

      {/* 入退室 UI */}
      <div
        className="flex flex-col rounded bg-gray-200 mb-1 p-2 gap-2"
        style={{
          pointerEvents: isUIEnabled ? "auto" : "none",
          opacity: isUIEnabled ? 1 : 0.5,
          transition: "opacity 0.2s"
        }}
      >
        {column5 === "欠席" || column5 === "欠席(欠席時対応加算を取らない)" ? (
          <div className="text-xs font-bold text-red-600 mb-3">欠席</div>
        ) : hasBothEnterAndAbsent(column5) ? (
          <>
            <button
              className="btn-blue p-2 w-[80px]"
              onClick={() => clickEnterButton(column5Html)}
              disabled={!isUIEnabled}
            >
              入室
            </button>

            <button
              className="btn-red mt-2 p-2 w-[80px]"
              onClick={() => clickAbsenceButton(column5Html)}
              disabled={!isUIEnabled}
            >
              欠席
            </button>
          </>
        ) : isTimeFormat(column5) ? (
          <>
            <div className="">入室: {column5}</div>

            {isTimeFormat(column6) ? (
              <div className="mt-2">退室: {column6}</div>
            ) : (
              <button
                className="btn-green mt-4"
                onClick={() => clickExitButton(column5Html)}
                disabled={!isUIEnabled}
              >
                退室
              </button>
            )}

            {isTimeFormat(column5) && isTimeFormat(column6) && (
              <button
                className="btn-purple mt-4 p-2"
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
              className="btn-blue p-2 w-[80px]"
              onClick={() => clickEnterButton(column5Html)}
              disabled={!isUIEnabled}
            >
              入室
            </button>

            <button
              className="btn-green mt-2 p-2 w-[80px]"
              onClick={() => clickExitButton(column5Html)}
              disabled={!isUIEnabled}
            >
              退出
            </button>
          </>
        )}
      </div>

      {/* AI + メモツール */}
      <div className="mt-4 border-t rounded bg-gray-200 border-gray-300 pt-3">
          <MemoContainer />
      </div>

    </div>
  )
}

export default ChildMemoPanel
