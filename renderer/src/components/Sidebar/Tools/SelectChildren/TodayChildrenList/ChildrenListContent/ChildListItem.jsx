// src/components/Sidebar/SelectChildrenList/ChildListItem.jsx

export default function ChildListItem({
  child,
  isSelected,
  onSelect,
  getTitle,
}) {
  const notesTitle = getTitle?.(child)

  return (
    <li
      title={notesTitle}
      className={`p-2 my-1 border rounded cursor-pointer flex justify-between ${
        isSelected
          ? "bg-cyan-200 border-l-4 border-cyan-700 font-bold"
          : "bg-gray-50 hover:bg-gray-200"
      }`}
      onClick={() =>
        onSelect(child.children_id, child.children_name, child.pc_name)
      }
    >
      <span>
        {child.children_id}: {child.children_name} : {child.pc_name || ""}
      </span>
      <input type="checkbox"></input>
    </li>
  )
}

