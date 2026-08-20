import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppState } from '@/AppStateContext'
import { getChildKadaiGraph } from '../../function/GetChildKadaiGraph'

const list = (value) => Array.isArray(value) ? value : []

export default function ScoreChartPage({ childrenId, recordTypeId, onBack }) {
  const { databaseState } = useAppState()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const child = useMemo(() => list(databaseState?.children).find((x) => Number(x.id) === Number(childrenId)), [childrenId, databaseState?.children])
  const type = useMemo(() => list(databaseState?.record_types).find((x) => Number(x.id) === Number(recordTypeId)), [databaseState?.record_types, recordTypeId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getChildKadaiGraph({ childrenId, recordTypeId })
      .then((data) => {
        if (!cancelled) setRecords(data.map((x) => ({ ...x, dateLabel: String(x.date ?? '').slice(0, 10), score: Number(x.score ?? 0), mistakes: Number(x.mistakes ?? 0) })))
      })
      .catch((reason) => {
        if (!cancelled) setError(reason?.message || 'グラフデータの取得に失敗しました。')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [childrenId, recordTypeId])

  return (
    <section className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">{child?.name ?? '児童'}の課題グラフ</h2><p className="text-sm text-gray-600">記録タイプ: {type?.name ?? recordTypeId}</p></div>
        <button type="button" onClick={onBack} className="rounded bg-gray-500 px-4 py-2 text-sm text-white">一覧へ戻る</button>
      </div>
      {loading && <p className="py-16 text-center">読み込み中...</p>}
      {!loading && error && <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && records.length === 0 && <p className="py-16 text-center">表示できる記録がありません。</p>}
      {!loading && !error && records.length > 0 && (
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={records}>
              <CartesianGrid strokeDasharray="5 5" /><XAxis dataKey="dateLabel" /><YAxis allowDecimals={false} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="score" name="点数" stroke="#2563eb" strokeWidth={3} />
              <Line type="monotone" dataKey="mistakes" name="ミス数" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
