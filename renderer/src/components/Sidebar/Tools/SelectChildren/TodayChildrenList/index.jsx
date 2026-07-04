// src/components/Sidebar/SelectChildrenList/TodayChildrenList/index.jsx
// 子どもリストを表示するコンポーネント
import { useState, useMemo, useEffect, useCallback } from "react"
import { useDataBase } from "@/hooks/useDataBase"
import { useAppState } from "@/AppStateContext"
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

/**
 * TIME文字列を分に変換する
 *
 * 対応例:
 * - "09:30:00" → 570
 * - "09:30"    → 570
 * - "9:30"     → 570
 * - "1200"     → 720
 * - "930"      → 570
 */
function timeToMinutes(time) {
  if (time == null || time === "") {
    return null
  }

  const value = String(time).trim()

  // "HH:mm" / "HH:mm:ss"
  if (value.includes(":")) {
    const [hourText, minuteText] = value.split(":")
    const hour = Number(hourText)
    const minute = Number(minuteText)

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return null
    }

    return hour * 60 + minute
  }

  // "1200" / "0930" / "930"
  const onlyNumber = value.replace(/\D/g, "")

  if (!onlyNumber) {
    return null
  }

  const normalized = onlyNumber.padStart(4, "0")
  const hour = Number(normalized.slice(0, -2))
  const minute = Number(normalized.slice(-2))

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  return hour * 60 + minute
}

/**
 * support_end_time が 12:00 以下なら午前児童
 */
function isMorningChild(child) {
  if (!child?.support_start_time || !child?.support_end_time) {
    return false
  }

  const endMinutes = timeToMinutes(child.support_end_time)

  if (endMinutes == null) {
    return false
  }

  return endMinutes <= 12 * 60
}

export default function TodayChildrenList() {
  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
  } = useDataBase()

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
    setDoneChildIds((prev) => {
      if (checked) {
        return [...new Set([...prev, child.children_id])]
      }

      return prev.filter((id) => id !== child.children_id)
    })
  }

  const getAttendanceItem = useCallback(
    (childId) => getAttendanceItemForChild(attendanceData, childId),
    [attendanceData]
  )

  const isChildVisible = useCallback(
    (child) => {
      const mode = Number(SELECT_CHILD_FILTER_MODE ?? 0)
      const attendanceItem = getAttendanceItem(child.children_id)

      const hiddenByAttendance = shouldHideChildByFilter(
        attendanceItem,
        SELECT_CHILD_FILTER_MODE
      )

      const morning = isMorningChild(child)

      // 0: 全件表示
      if (mode === 0) {
        return true
      }

      // 1: 欠席を除く
      if (mode === 1) {
        return !hiddenByAttendance
      }

      // 2: 欠席・午前を除く
      if (mode === 2) {
        return !hiddenByAttendance && !morning
      }

      // 3: 欠席・午前・退室済みを除く
      // 欠席・退室済みは shouldHideChildByFilter 側で判定
      // 午前児童だけここで追加判定
      if (mode === 3) {
        return !hiddenByAttendance && !morning
      }

      return true
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
        base.filter((child) => Number(child.priority) === 0)
      ),
      sometimesChildren: filterVisibleChildren(
        base.filter((child) => Number(child.priority) === 1)
      ),
      temporaryChildren: filterVisibleChildren(
        base.filter((child) => Number(child.priority) === 2)
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
  // フィルタ変更時:
  // 欠席・午前・退室済みなどで非表示になった児童の選択を解除
  // ==============================
  useEffect(() => {
    if (!SELECT_CHILD) return

    const visibleChildren = getVisibleChildrenForTab(activeTab)

    const selectedStillVisible = visibleChildren.some(
      (child) => String(child.children_id) === String(SELECT_CHILD)
    )

    if (selectedStillVisible) {
      return
    }

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