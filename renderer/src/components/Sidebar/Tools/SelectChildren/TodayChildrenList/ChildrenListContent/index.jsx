// src/components/Sidebar/SelectChildrenList/TodayChildrenList/ChildrenListContent.jsx
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
}) {
  const renderChildItem = (child) => (
    <ChildListItem
      key={child.children_id}
      child={child}
      isSelected={selectedChildId === child.children_id}
      onSelect={onSelectChild}
      getTitle={getChildNotesTitle}
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
        ? waitingChildrenData.map(child => (
            <li
              key={child.children_id}
              title={getChildNotesTitle(child)}
              className="p-2 border-b cursor-pointer hover:bg-yellow-100"
              onClick={() =>
                onSelectChild(
                  child.children_id,
                  child.children_name,
                  child.pc_name
                )
              }
            >
              {child.children_id}: {child.children_name}
            </li>
          ))
        : <li>{MESSAGES.INFO.NO_WAITING}</li>

    case TABS.EXPERIENCE:
      return experienceChildrenData?.length
        ? experienceChildrenData.map(child => (
            <li
              key={child.children_id}
              title={getChildNotesTitle(child)}
              className="p-2 border-b cursor-pointer hover:bg-blue-100"
              onClick={() =>
                onSelectChild(
                  child.children_id,
                  child.children_name,
                  child.pc_name
                )
              }
            >
              {child.children_id}: {child.children_name}
            </li>
          ))
        : <li>{MESSAGES.INFO.NO_EXPERIENCE}</li>

    default:
      return null
  }
}