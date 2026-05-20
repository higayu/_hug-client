// src/components/Sidebar/SelectChildrenList/TodayChildrenList.jsx
// 子どもリストを表示するコンポーネント
import { useState, useMemo } from "react"
import { useChildrenList } from "@/hooks/useChildrenList.js"
import { useAppState } from "@/contexts/appState"
import { ELEMENT_IDS, MESSAGES } from "@/utils/constants.js"

const TABS = {
  NORMAL: "normal",
  SOMETIMES: "sometimes",
  TEMPORARY: "temporary",
  WAITING: "waiting",
  EXPERIENCE: "experience",
}

function TodayChildrenList() {
  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
  } = useChildrenList()

  const {
    SELECT_CHILD,
    setSelectedChild,
    setSelectedPcName,
    attendanceData,
  } = useAppState()

  const [activeTab, setActiveTab] = useState(TABS.NORMAL)

  // ==============================
  // priority 別に分類
  // ==============================
  const {
    normalChildren,
    sometimesChildren,
    temporaryChildren,
  } = useMemo(() => {
    const base = Array.isArray(childrenData) ? childrenData : []

    return {
      normalChildren: base.filter(c => Number(c.priority) === 0),
      sometimesChildren: base.filter(c => Number(c.priority) === 1),
      temporaryChildren: base.filter(c => Number(c.priority) === 2),
    }
  }, [childrenData])

  // ==============================
  // 子ども選択
  // ==============================
  const handleChildSelect = (childId, childName, pcName = "") => {
    setSelectedChild(childId, childName)
    setSelectedPcName(pcName || "")

    if (window.AppState) {
      window.AppState.SELECT_CHILD = childId
      window.AppState.SELECT_CHILD_NAME = childName
      window.AppState.SELECT_PC_NAME = pcName || ""
    }
  }

  // ==============================
  // 通常描画
  // ==============================
  const renderChildItem = (c) => {
    const isSelected = SELECT_CHILD === c.children_id

    return (
      <li
        key={c.children_id}
        className={`p-2 my-1 border rounded cursor-pointer flex justify-between ${
          isSelected
            ? "bg-cyan-200 border-l-4 border-cyan-700 font-bold"
            : "bg-gray-50 hover:bg-gray-200"
        }`}
        onClick={() =>
          handleChildSelect(c.children_id, c.children_name, c.pc_name)
        }
      >
        <span>
          {c.children_id}: {c.children_name} : {c.pc_name || ""}
        </span>
      </li>
    )
  }

  // ==============================
  // タブ描画
  // ==============================
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.NORMAL:
        return normalChildren.length
          ? normalChildren.map(renderChildItem)
          : <li>{MESSAGES.INFO.NO_CHILDREN}</li>

      case TABS.SOMETIMES:
        return sometimesChildren.length
          ? sometimesChildren.map(renderChildItem)
          : <li>時折対応の児童はいません</li>

      case TABS.TEMPORARY:
        return temporaryChildren.length
          ? temporaryChildren.map(renderChildItem)
          : <li>一時対応の児童はいません</li>

      case TABS.WAITING:
        return waitingChildrenData?.length
          ? waitingChildrenData.map(c => (
              <li
                key={c.children_id}
                className="p-2 border-b cursor-pointer hover:bg-yellow-100"
                onClick={() =>
                  handleChildSelect(c.children_id, c.children_name, c.pc_name)
                }
              >
                {c.children_id}: {c.children_name}
              </li>
            ))
          : <li>{MESSAGES.INFO.NO_WAITING}</li>

      case TABS.EXPERIENCE:
        return experienceChildrenData?.length
          ? experienceChildrenData.map(c => (
              <li
                key={c.children_id}
                className="p-2 border-b cursor-pointer hover:bg-blue-100"
                onClick={() =>
                  handleChildSelect(c.children_id, c.children_name)
                }
              >
                {c.children_id}: {c.children_name}
              </li>
            ))
          : <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>

      default:
        return null
    }
  }

  // ==============================
  // JSX
  // ==============================
  return (
    <div className="sidebar-content flex-1 overflow-y-auto">

      {/* -------- Tabs -------- */}
      <div className="flex gap-1 mb-2">
        {[
          ["通常", TABS.NORMAL],
          ["時折", TABS.SOMETIMES],
          ["一時", TABS.TEMPORARY],
          ["キャンセル", TABS.WAITING],
          ["体験", TABS.EXPERIENCE],
        ].map(([label, key]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1 rounded text-sm ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* -------- List -------- */}
      <ul
        id={ELEMENT_IDS.CHILDREN_LIST}
        className="list-none p-0 m-0"
      >
        {renderTabContent()}
      </ul>
    </div>
  )
}

export default TodayChildrenList
