// renderer/src/components/Sidebar/Tools/SelectChildren/TodayChildrenList/ChildrenListContent/ChildListItem.jsx
import DoneToggleButton from "./DoneToggleButton"

export default function ChildListItem({
  child,
  isSelected = false,
  onSelect,
  getTitle,
  baseClassName = "p-2 my-1 border rounded cursor-pointer flex justify-between items-center",
  selectedClassName = "bg-cyan-200 border-l-4 border-cyan-700 font-bold",
  defaultClassName = "bg-gray-50 hover:bg-gray-200",
  showPcName = true,
  isDone = false,
  onToggleDone,
}) {
  const notesTitle = getTitle?.(child)

  const itemClassName = `${baseClassName} ${
    isSelected ? selectedClassName : defaultClassName
  }`

  return (
    <li
      title={notesTitle}
      className={itemClassName}
      onClick={() =>
        onSelect(child.children_id, child.children_name, child.pc_name)
      }
    >
      <span>
        {child.children_id}: {child.children_name}
        {showPcName ? ` : ${child.pc_name || ""}` : ""}
      </span>

      <DoneToggleButton
        checked={isDone}
        onChange={(checked) => onToggleDone?.(child, checked)}
      />
    </li>
  )
}