// src/components/Sidebar/SelectChildrenList/TodayChildrenList/index.jsx
// 子どもリストを表示するコンポーネント

import { useState } from "react"
import { useAppState } from "@/AppStateContext"
import { ELEMENT_IDS } from "@/utils/app/constants.js"
import ChildrenListTabs from "./ChildrenListTabs"
import ChildrenListContent from "./ChildrenListContent"
import { TABS } from "./constants"
import { useTodayChildrenListDebug } from "./useTodayChildrenListDebug"
import { useTodayChildrenListController } from "./useTodayChildrenListController"

export default function TodayChildrenList() {
  const appState = useAppState()

  const {
    // appStateSlice
    SELECT_CHILD,
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
    setSelectedChild,
    setSelectedPcName,
  } = appState

  const [activeTab, setActiveTab] = useState(TABS.NORMAL)
  const [doneChildIds, setDoneChildIds] = useState([])

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
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
    attendanceData,
    activeTab,
    setDoneChildIds,
    setSelectedChild,
    setSelectedPcName,
  })

  useTodayChildrenListDebug({
    appState,

    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    CURRENT_DAY_OF_WEEK,
    childrenData,
    waiting_childrenData,
    Experience_childrenData,
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