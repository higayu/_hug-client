import { useCallback, useEffect, useState } from 'react'
import ChildKadaiTable from './ChildKadaiTable'
import CreateKadai from './ChildKadaiTable/CreateKadai'
import EditKadai from './ChildKadaiTable/EditKadai'
import ScoreChartPage from './ChildKadaiTable/graph/ScoreChartPage'
import getChildKadaiGraph from './function/GetChildKadaiGraph'
import deleteChildKadai from './function/DeleteChildKadai'

export default function ChildKadai() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [graph, setGraph] = useState(null)
  const [edit, setEdit] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setRecords(await getChildKadaiGraph()) }
    catch (reason) { setRecords([]); setError(reason?.message || '課題記録の取得に失敗しました。') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  const back = useCallback(() => { setGraph(null); setEdit(null); setCreating(false) }, [])
  const saved = useCallback(async () => { back(); await load() }, [back, load])
  const remove = useCallback(async (record) => {
    if (!window.confirm('この課題記録を削除しますか？')) return

    setError('')
    try {
      await deleteChildKadai(record.id)
      setRecords((current) => current.filter((item) => Number(item.id) !== Number(record.id)))
    } catch (reason) {
      setError(reason?.message || '課題記録の削除に失敗しました。')
    }
  }, [])

  if (edit) return <EditKadai record={edit} onCancel={back} onSaved={saved} />
  if (creating) return <CreateKadai onCancel={back} onSaved={saved} />
  if (graph) return <ScoreChartPage {...graph} onBack={back} />
  return <ChildKadaiTable childRecords={records} loading={loading} error={error} onCreate={() => setCreating(true)} onEdit={setEdit} onDelete={remove} onShowGraph={setGraph} />
}

export { ChildKadaiTable }
