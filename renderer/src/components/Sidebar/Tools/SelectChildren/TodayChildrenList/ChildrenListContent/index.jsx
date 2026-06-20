// renderer/src/components/Sidebar/Tools/SelectChildren/TodayChildrenList/ChildrenListContent/index.jsx
import { MESSAGES } from "@/utils/app/constants.js"
import ChildListItem from "./ChildListItem"
import { TABS } from "../constants"

export default function ChildrenListContent({
  activeTab,
  normalChildren,
  sometimesChildren,
  temporaryChildren,
  waitingChildrenData,
  experienceChildrenData,
  selectedChildId,
  onSelectChild,
  getChildNotesTitle,
  doneChildIds = [],
  onToggleDone,
  getChildAbsent,
  getChildExited,
}) {
  const isChildDone = (child) => {
    return doneChildIds.includes(child.children_id)
  }

  const renderChildItem = (child, showPcName = true) => (
    <ChildListItem
      key={child.children_id}
      child={child}
      isSelected={selectedChildId === child.children_id}
      onSelect={onSelectChild}
      getTitle={getChildNotesTitle}
      showPcName={showPcName}
      isDone={isChildDone(child)}
      onToggleDone={onToggleDone}
      isAbsent={getChildAbsent?.(child) ?? false}
      isExited={getChildExited?.(child) ?? false}
    />
  )

  switch (activeTab) {
    case TABS.NORMAL:
      return normalChildren.length
        ? normalChildren.map((child) => renderChildItem(child))
        : <li>{MESSAGES.INFO.NO_CHILDREN}</li>

    case TABS.SOMETIMES:
      return sometimesChildren.length
        ? sometimesChildren.map((child) => renderChildItem(child))
        : <li>時折対応の児童はいません</li>

    case TABS.TEMPORARY:
      return temporaryChildren.length
        ? temporaryChildren.map((child) => renderChildItem(child))
        : <li>一時対応の児童はいません</li>

    case TABS.WAITING:
      return waitingChildrenData?.length
        ? waitingChildrenData.map((child) => renderChildItem(child, false))
        : <li>{MESSAGES.INFO.NO_WAITING}</li>

    case TABS.EXPERIENCE:
      return experienceChildrenData?.length
        ? experienceChildrenData.map((child) => renderChildItem(child, false))
        : <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>

    default:
      return null
  }
}
