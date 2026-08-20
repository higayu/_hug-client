export default function ChildKadaiFilter({ filters, setFilters, children, recordTypes }) {
  const update = (key) => (event) => setFilters((current) => ({
    ...current,
    [key]: event.target.value,
  }))

  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <input type="search" value={filters.name} onChange={update('name')} placeholder="児童名で検索" className="rounded border px-3 py-1" />
      <select value={filters.childrenId} onChange={update('childrenId')} className="rounded border px-3 py-1">
        <option value="">児童：すべて</option>
        {children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}
      </select>
      <select value={filters.recordTypeId} onChange={update('recordTypeId')} className="rounded border px-3 py-1">
        <option value="">記録タイプ：すべて</option>
        {recordTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
      </select>
    </div>
  )
}
