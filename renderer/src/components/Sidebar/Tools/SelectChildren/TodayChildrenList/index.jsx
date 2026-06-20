// src/components/Sidebar/SelectChildrenList/TodayChildrenList/index.jsx
// 子どもリストを表示するコンポーネント
import { useState, useMemo, useEffect, useCallback } from "react"
import { useChildrenList } from "@/hooks/useChildrenList.js"
import { useAppState } from "@/contexts/appState"
import { ELEMENT_IDS } from "@/utils/app/constants.js"
import {
  getAttendanceItemForChild,
  isChildAbsent,
  isChildExited,
  shouldHideChildByFilter,
} from "@/utils/attendance/helpers/attendanceStatus.js"
import ChildrenListTabs from "./ChildrenListTabs"
import ChildrenListContent from "./ChildrenListContent"
import { TABS } from "./constants"

export default function TodayChildrenList() {
  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
  } = useChildrenList()

  const {
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    attendanceData,
    setSelectedChild,
    setSelectedPcName,
  } = useAppState()

  const [activeTab, setActiveTab] = useState(TABS.NORMAL)

  const [doneChildIds, setDoneChildIds] = useState([])

  const handleToggleDone = (child, checked) => {
    setDoneChildIds(prev => {
      if (checked) {
        return [...new Set([...prev, child.children_id])]
      }

      return prev.filter(id => id !== child.children_id)
    })
  }

  const getAttendanceItem = useCallback(
    (childId) => getAttendanceItemForChild(attendanceData, childId),
    [attendanceData]
  )

  const isChildVisible = useCallback(
    (child) => {
      const attendanceItem = getAttendanceItem(child.children_id)
      return !shouldHideChildByFilter(attendanceItem, SELECT_CHILD_FILTER_MODE)
    },
    [getAttendanceItem, SELECT_CHILD_FILTER_MODE]
  )

  const getChildAbsent = useCallback(
    (child) => isChildAbsent(getAttendanceItem(child.children_id)),
    [getAttendanceItem]
  )

  const getChildExited = useCallback(
    (child) => isChildExited(getAttendanceItem(child.children_id)),
    [getAttendanceItem]
  )

  const filterVisibleChildren = useCallback(
    (children) => {
      const list = Array.isArray(children) ? children : []
      return list.filter(isChildVisible)
    },
    [isChildVisible]
  )

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
      normalChildren: filterVisibleChildren(
        base.filter(child => Number(child.priority) === 0)
      ),
      sometimesChildren: filterVisibleChildren(
        base.filter(child => Number(child.priority) === 1)
      ),
      temporaryChildren: filterVisibleChildren(
        base.filter(child => Number(child.priority) === 2)
      ),
    }
  }, [childrenData, filterVisibleChildren])

  const visibleWaitingChildren = useMemo(
    () => filterVisibleChildren(waitingChildrenData),
    [waitingChildrenData, filterVisibleChildren]
  )

  const visibleExperienceChildren = useMemo(
    () => filterVisibleChildren(experienceChildrenData),
    [experienceChildrenData, filterVisibleChildren]
  )

  const getVisibleChildrenForTab = useCallback(
    (tab) => {
      switch (tab) {
        case TABS.NORMAL:
          return normalChildren
        case TABS.SOMETIMES:
          return sometimesChildren
        case TABS.TEMPORARY:
          return temporaryChildren
        case TABS.WAITING:
          return visibleWaitingChildren
        case TABS.EXPERIENCE:
          return visibleExperienceChildren
        default:
          return []
      }
    },
    [
      normalChildren,
      sometimesChildren,
      temporaryChildren,
      visibleWaitingChildren,
      visibleExperienceChildren,
    ]
  )

  // ==============================
  // 初期選択: 通常タブの最初の児童
  // ==============================
  useEffect(() => {
    if (SELECT_CHILD || normalChildren.length === 0) return

    const first = normalChildren[0]

    setSelectedChild(first.children_id, first.children_name)
    setSelectedPcName(first.pc_name || "")

    if (window.AppState) {
      window.AppState.SELECT_CHILD = first.children_id
      window.AppState.SELECT_CHILD_NAME = first.children_name
      window.AppState.SELECT_PC_NAME = first.pc_name || ""
    }
  }, [normalChildren, SELECT_CHILD, setSelectedChild, setSelectedPcName])

  // ==============================
  // フィルタ変更時: 非表示になった児童の選択を解除
  // ==============================
  useEffect(() => {
    if (!SELECT_CHILD) return

    const attendanceItem = getAttendanceItem(SELECT_CHILD)
    if (!shouldHideChildByFilter(attendanceItem, SELECT_CHILD_FILTER_MODE)) {
      return
    }

    const visibleChildren = getVisibleChildrenForTab(activeTab)
    const first = visibleChildren[0]

    if (!first) {
      setSelectedChild("", "")
      setSelectedPcName("")

      if (window.AppState) {
        window.AppState.SELECT_CHILD = ""
        window.AppState.SELECT_CHILD_NAME = ""
        window.AppState.SELECT_PC_NAME = ""
      }
      return
    }

    setSelectedChild(first.children_id, first.children_name)
    setSelectedPcName(first.pc_name || "")

    if (window.AppState) {
      window.AppState.SELECT_CHILD = first.children_id
      window.AppState.SELECT_CHILD_NAME = first.children_name
      window.AppState.SELECT_PC_NAME = first.pc_name || ""
    }
  }, [
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    activeTab,
    getAttendanceItem,
    getVisibleChildrenForTab,
    setSelectedChild,
    setSelectedPcName,
  ])

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
  // title
  // ==============================
  const getChildNotesTitle = (child) => {
    const notes2 = child?.notes2?.trim()
    return notes2 || undefined
  }

  return (
    <div className="sidebar-content flex-1 overflow-y-auto">
      <ChildrenListTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <ul
        id={ELEMENT_IDS.CHILDREN_LIST}
        className="list-none p-0 m-0"
      >
        <ChildrenListContent
          activeTab={activeTab}
          normalChildren={normalChildren}
          sometimesChildren={sometimesChildren}
          temporaryChildren={temporaryChildren}
          waitingChildrenData={visibleWaitingChildren}
          experienceChildrenData={visibleExperienceChildren}
          selectedChildId={SELECT_CHILD}
          onSelectChild={handleChildSelect}
          getChildNotesTitle={getChildNotesTitle}
          doneChildIds={doneChildIds}
          onToggleDone={handleToggleDone}
          getChildAbsent={getChildAbsent}
          getChildExited={getChildExited}
        />
      </ul>
    </div>
  )
}
