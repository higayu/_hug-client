import { useMemo, useState } from 'react'
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useAppState } from '@/AppStateContext'
import ChildKadaiFilter from './common/ChildKadaiFilter'

ModuleRegistry.registerModules([AllCommunityModule])
const list = (value) => Array.isArray(value) ? value : []

export default function ChildKadaiTable({ onShowGraph }) {
  const { FACILITY_ID, databaseState, databaseLoading } = useAppState()
  const [filters, setFilters] = useState({ name: '', childrenId: '', recordTypeId: '' })
  const children = list(databaseState?.children)
  const recordTypes = list(databaseState?.record_types)

  const rows = useMemo(() => {
    const childMap = new Map(children.map((x) => [Number(x.id), x]))
    const typeMap = new Map(recordTypes.map((x) => [Number(x.id), x]))
    const facilityMap = new Map(list(databaseState?.facilitys).map((x) => [Number(x.id), x]))
    return list(databaseState?.child_records)
      .filter((x) => !FACILITY_ID || Number(x.facility_id) === Number(FACILITY_ID))
      .map((x) => ({
        ...x,
        child_name: childMap.get(Number(x.children_id))?.name ?? '',
        record_type_name: typeMap.get(Number(x.record_type_id))?.name ?? '',
        facility_name: facilityMap.get(Number(x.facility_id))?.name ?? '',
      }))
      .filter((x) => !filters.name || x.child_name.includes(filters.name))
      .filter((x) => !filters.childrenId || Number(x.children_id) === Number(filters.childrenId))
      .filter((x) => !filters.recordTypeId || Number(x.record_type_id) === Number(filters.recordTypeId))
  }, [FACILITY_ID, children, databaseState, filters, recordTypes])

  const columns = useMemo(() => [
    {
      headerName: 'グラフ', width: 100, sortable: false,
      cellRenderer: ({ data }) => (
        <button type="button" onClick={() => onShowGraph({ childrenId: data.children_id, recordTypeId: data.record_type_id })} className="rounded bg-blue-600 px-3 py-1 text-xs text-white">表示</button>
      ),
    },
    { headerName: '日付', field: 'date', sort: 'desc' },
    { headerName: '児童名', field: 'child_name' },
    { headerName: '記録タイプ', field: 'record_type_name' },
    { headerName: '点数', field: 'score' },
    { headerName: 'ミス数', field: 'mistakes' },
    { headerName: '施設名', field: 'facility_name' },
    { headerName: 'メモ1', field: 'memo1', flex: 1 },
    { headerName: 'メモ2', field: 'memo2', flex: 1 },
  ], [onShowGraph])

  return (
    <section className="p-4">
      <h2 className="mb-4 text-lg font-semibold">児童課題記録一覧</h2>
      <ChildKadaiFilter filters={filters} setFilters={setFilters} children={children} recordTypes={recordTypes} />
      <div style={{ height: 500 }}>
        <AgGridReact rowData={rows} columnDefs={columns} pagination paginationPageSize={20} loading={databaseLoading} theme={themeQuartz} />
      </div>
    </section>
  )
}
