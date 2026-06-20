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
}) {
  const isChildDone = (child) => {
    return doneChildIds.includes(child.children_id)
  }

  const renderChildItem = (child) => (
    <ChildListItem
      key={child.children_id}
      child={child}
      isSelected={selectedChildId === child.children_id}
      onSelect={onSelectChild}
      getTitle={getChildNotesTitle}
      isDone={isChildDone(child)}
      onToggleDone={onToggleDone}
    />
  )

  const renderWaitingChildItem = (child) => (
    <ChildListItem
      key={child.children_id}
      child={child}
      isSelected={selectedChildId === child.children_id}
      onSelect={onSelectChild}
      getTitle={getChildNotesTitle}
      baseClassName="p-2 border-b cursor-pointer flex justify-between items-center"
      defaultClassName="hover:bg-yellow-100"
      selectedClassName="bg-yellow-200 border-l-4 border-yellow-600 font-bold"
      showPcName={false}
      isDone={isChildDone(child)}
      onToggleDone={onToggleDone}
    />
  )

  const renderExperienceChildItem = (child) => (
    <ChildListItem
      key={child.children_id}
      child={child}
      isSelected={selectedChildId === child.children_id}
      onSelect={onSelectChild}
      getTitle={getChildNotesTitle}
      baseClassName="p-2 border-b cursor-pointer flex justify-between items-center"
      defaultClassName="hover:bg-blue-100"
      selectedClassName="bg-blue-200 border-l-4 border-blue-600 font-bold"
      showPcName={false}
      isDone={isChildDone(child)}
      onToggleDone={onToggleDone}
    />
  )

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
        ? waitingChildrenData.map(renderWaitingChildItem)
        : <li>{MESSAGES.INFO.NO_WAITING}</li>

    case TABS.EXPERIENCE:
      return experienceChildrenData?.length
        ? experienceChildrenData.map(renderExperienceChildItem)
        : <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>

    default:
      return null
  }
}