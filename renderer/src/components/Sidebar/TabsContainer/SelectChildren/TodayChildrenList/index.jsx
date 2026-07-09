// src/components/Sidebar/SelectChildrenList/TodayChildrenList/index.jsx
// 子どもリストを表示するコンポーネント

import { useEffect, useMemo, useState } from "react"
import { useAppState } from "@/AppStateContext"
import { splitChildrenData } from "@/AppStateContext/splitChildrenData"
import { ELEMENT_IDS } from "@/utils/app/constants.js"
import ChildrenListTabs from "./ChildrenListTabs"
import ChildrenListContent from "./ChildrenListContent"
import { TABS } from "./constants"
import { useTodayChildrenListDebug } from "./debug";
import { useTodayChildrenListController } from "./useTodayChildrenListController";

export default function TodayChildrenList() {
  const appState = useAppState()

  const {
    // appStateSlice
    SELECT_CHILD,
    SELECT_CHILD_NAME,
    SELECT_CHILD_FILTER_MODE,
    CURRENT_DAY_OF_WEEK,
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
    attendanceData,

    // databaseSlice
    databaseState,
    dbChildren,
    dbFacilityChildren,
    dbPc,
    dbPcToChildren,
    dbDayOfWeek,

    // actions
    updateAppState,
    setSelectedChild,
    setSelectedPcName,
  } = appState

  const [activeTab, setActiveTab] = useState(TABS.NORMAL)
  const [doneChildIds, setDoneChildIds] = useState([])

  // ==============================
  // 曜日ID
  // ==============================
  const weekdayId = useMemo(() => {
    return CURRENT_DAY_OF_WEEK?.weekdayId ?? null
  }, [CURRENT_DAY_OF_WEEK])

  // ==============================
  // 表示用の児童データ
  // ChildrenListContent へ渡す元データ
  // ==============================
  const [displayChildrenData, setDisplayChildrenData] = useState(() =>
    Array.isArray(childrenData) ? childrenData : []
  )

  const [displayWaitingChildrenData, setDisplayWaitingChildrenData] = useState(
    () => (Array.isArray(waiting_childrenData) ? waiting_childrenData : [])
  )

  const [displayExperienceChildrenData, setDisplayExperienceChildrenData] =
    useState(() =>
      Array.isArray(Experience_childrenData) ? Experience_childrenData : []
    )

  // ==============================
  // 曜日変更時:
  // 古い AppState の childrenData を削除してから、
  // splitChildrenData の結果を AppState / 表示用 state に反映する
  // ==============================
  useEffect(() => {
    let cancelled = false

    async function refreshChildrenByDayOfWeek() {
      const staffId = appState?.STAFF_ID
      const facilityId = appState?.FACILITY_ID
      const tables = appState?.databaseState ?? databaseState

      if (!tables) {
        console.warn(
          "[TodayChildrenList] databaseState が空のため児童リスト更新をスキップ"
        )
        return
      }

      if (weekdayId == null) {
        console.warn(
          "[TodayChildrenList] weekdayId が空のため児童リスト更新をスキップ"
        )
        return
      }

      try {
        // ==============================
        // 1. 古い AppState の児童データを削除
        // ==============================
        const emptyChildrenData = {
          childrenData: [],
          waiting_childrenData: [],
          Experience_childrenData: [],
        }

        setDisplayChildrenData([])
        setDisplayWaitingChildrenData([])
        setDisplayExperienceChildrenData([])

        updateAppState?.(emptyChildrenData)

        if (window.AppState) {
          window.AppState.childrenData = []
          window.AppState.waiting_childrenData = []
          window.AppState.Experience_childrenData = []
        }

        console.log("[TodayChildrenList] 古い児童データを削除", {
          weekdayId,
          previousChildrenDataCount: Array.isArray(childrenData)
            ? childrenData.length
            : "not array",
          previousWaitingChildrenDataCount: Array.isArray(waiting_childrenData)
            ? waiting_childrenData.length
            : "not array",
          previousExperienceChildrenDataCount: Array.isArray(
            Experience_childrenData
          )
            ? Experience_childrenData.length
            : "not array",
        })

        // ==============================
        // 2. 新しい曜日の児童データを取得
        // ==============================
        const result = await splitChildrenData({
          tables,
          staffId,
          weekdayId,
          facility_id: facilityId,
        })

        if (cancelled) {
          return
        }

        // splitChildrenData の戻りキーは AppState 名と異なる（useReduxBindings と同じ）
        const nextChildrenData = Array.isArray(result?.week_children)
          ? result.week_children
          : []

        const nextWaitingChildrenData = Array.isArray(result?.waiting_children)
          ? result.waiting_children
          : []

        const nextExperienceChildrenData = Array.isArray(
          result?.Experience_children
        )
          ? result.Experience_children
          : []

        // ==============================
        // 3. 表示用 state を更新
        // ==============================
        setDisplayChildrenData(nextChildrenData)
        setDisplayWaitingChildrenData(nextWaitingChildrenData)
        setDisplayExperienceChildrenData(nextExperienceChildrenData)

        // ==============================
        // 4. AppState / Redux 側も新しい値に更新
        // ==============================
        updateAppState?.({
          childrenData: nextChildrenData,
          waiting_childrenData: nextWaitingChildrenData,
          Experience_childrenData: nextExperienceChildrenData,
        })

        if (window.AppState) {
          window.AppState.childrenData = nextChildrenData
          window.AppState.waiting_childrenData = nextWaitingChildrenData
          window.AppState.Experience_childrenData = nextExperienceChildrenData
        }

        console.log("[TodayChildrenList] 曜日変更後の児童データを反映", {
          weekdayId,
          childrenDataCount: nextChildrenData.length,
          waitingChildrenDataCount: nextWaitingChildrenData.length,
          experienceChildrenDataCount: nextExperienceChildrenData.length,
        })

        console.table(
          nextChildrenData.map((child) => ({
            children_id: child?.children_id,
            children_name: child?.children_name,
            priority: child?.priority,
            pc_name: child?.pc_name,
            support_start_time: child?.support_start_time,
            support_end_time: child?.support_end_time,
          }))
        )
      } catch (error) {
        console.error(
          "[TodayChildrenList] 曜日変更時の児童リスト更新に失敗:",
          error
        )
      }
    }

    refreshChildrenByDayOfWeek()

    return () => {
      cancelled = true
    }
  }, [
    weekdayId,
    appState?.STAFF_ID,
    appState?.FACILITY_ID,
    appState?.databaseState,
    databaseState,
    updateAppState,
  ])

  const {
    weekChildrenData,
    waitingChildrenData,
    experienceChildrenData,

    normalChildren,
    sometimesChildren,
    temporaryChildren,
    visibleWaitingChildren,
    visibleExperienceChildren,

    handleChildSelect,
    handleToggleDone,
    getChildNotesTitle,
    getChildAbsent,
    getChildExited,
  } = useTodayChildrenListController({
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,

    // AppState の childrenData を直接渡さず、
    // 曜日変更で更新した表示用データを渡す
    childrenData: displayChildrenData,
    waiting_childrenData: displayWaitingChildrenData,
    Experience_childrenData: displayExperienceChildrenData,

    attendanceData,
    activeTab,
    setDoneChildIds,
    setSelectedChild,
    setSelectedPcName,
  })

  // ==============================
  // ChildrenListContent に渡る直前の確認ログ
  // ==============================
  useEffect(() => {
    console.log("[TodayChildrenList] ChildrenListContentへ渡す値", {
      activeTab,
      SELECT_CHILD,
      SELECT_CHILD_NAME,
      weekdayId,
      displayChildrenDataCount: displayChildrenData.length,
      normalChildrenCount: normalChildren.length,
      sometimesChildrenCount: sometimesChildren.length,
      temporaryChildrenCount: temporaryChildren.length,
      waitingChildrenCount: visibleWaitingChildren.length,
      experienceChildrenCount: visibleExperienceChildren.length,
    })
  }, [
    activeTab,
    SELECT_CHILD,
    SELECT_CHILD_NAME,
    weekdayId,
    displayChildrenData,
    normalChildren,
    sometimesChildren,
    temporaryChildren,
    visibleWaitingChildren,
    visibleExperienceChildren,
  ])

  useTodayChildrenListDebug({
    appState,

    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    CURRENT_DAY_OF_WEEK,

    // デバッグにも表示用データを渡す
    // これで画面表示とログの対象が一致する
    childrenData: displayChildrenData,
    waiting_childrenData: displayWaitingChildrenData,
    Experience_childrenData: displayExperienceChildrenData,

    attendanceData,

    databaseState,
    dbChildren,
    dbFacilityChildren,
    dbPc,
    dbPcToChildren,
    dbDayOfWeek,

    weekChildrenData,
    waitingChildrenData,
    experienceChildrenData,

    activeTab,
  })

  return (
    <div className="sidebar-content py-1 px-2 flex-1 overflow-y-auto">
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