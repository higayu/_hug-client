import { useState } from 'react'
import { useAppState } from '@/AppStateContext'
import { upsertChildKadai } from '../function/UpsertChildKadai'

const list = (value) => Array.isArray(value) ? value : []

export default function EditKadai({ record, onCancel, onSaved }) {
  const { databaseState } = useAppState()
  const [form, setForm] = useState({
    id: record.id, children_id: record.children_id ?? '', record_type_id: record.record_type_id ?? '',
    date: String(record.date ?? '').slice(0, 10), score: record.score ?? '', mistakes: record.mistakes ?? '',
    facility_id: record.facility_id ?? '', memo1: record.memo1 ?? '', memo2: record.memo2 ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const change = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }))
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const result = await upsertChildKadai({ ...form, score: form.score === '' ? null : Number(form.score), mistakes: form.mistakes === '' ? null : Number(form.mistakes) })
      await onSaved(result)
    } catch (reason) { setError(reason?.message || '更新に失敗しました。') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 bg-white p-6">
      <h2 className="text-xl font-bold">児童課題記録の編集</h2>
      <label className="block">日付<input required type="date" name="date" value={form.date} onChange={change} className="mt-1 w-full rounded border p-2" /></label>
      <label className="block">児童<select required name="children_id" value={form.children_id} onChange={change} className="mt-1 w-full rounded border p-2">{list(databaseState?.children).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="block">記録タイプ<select required name="record_type_id" value={form.record_type_id} onChange={change} className="mt-1 w-full rounded border p-2">{list(databaseState?.record_types).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="block">施設<select required name="facility_id" value={form.facility_id} onChange={change} className="mt-1 w-full rounded border p-2">{list(databaseState?.facilitys).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-4"><label>点数<input type="number" name="score" value={form.score} onChange={change} className="mt-1 w-full rounded border p-2" /></label><label>ミス数<input type="number" name="mistakes" value={form.mistakes} onChange={change} className="mt-1 w-full rounded border p-2" /></label></div>
      <label className="block">メモ1<input name="memo1" maxLength={255} value={form.memo1} onChange={change} className="mt-1 w-full rounded border p-2" /></label>
      <label className="block">メモ2<textarea name="memo2" value={form.memo2} onChange={change} className="mt-1 w-full rounded border p-2" /></label>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex justify-between"><button type="button" onClick={onCancel} className="rounded bg-gray-500 px-4 py-2 text-white">一覧へ戻る</button><button disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white">{saving ? '更新中...' : '更新'}</button></div>
    </form>
  )
}
