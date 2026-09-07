import { useMemo, useState } from 'react'
import { DUMMY_AI_TEXT, DUMMY_KADAI_RECORDS, DUMMY_RECORD_TYPES } from './dummyData'

const TABS = [
  { id: 'ai', label: 'AI支援' },
  { id: 'child-kadai', label: '児童課題' },
  { id: 'personal-record', label: '個人記録' },
]

function AiDummy({ selectedChild }) {
  const [text, setText] = useState(DUMMY_AI_TEXT)

  return (
    <div className="p-4">
      <div className="mb-2 text-sm font-semibold">AI支援（ダミー）</div>
      <div className="mb-2 text-xs text-gray-500">
        対象: {selectedChild?.children_name ?? '未選択'} / 実際のAI APIには送信しません。
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="min-h-40 w-full rounded border border-gray-300 p-3 text-sm"
      />
      <button
        type="button"
        onClick={() => setText(DUMMY_AI_TEXT)}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        ダミー回答を生成
      </button>
    </div>
  )
}

function KadaiDummy({ selectedChild }) {
  const [recordTypeId, setRecordTypeId] = useState(1)
  const rows = useMemo(
    () => DUMMY_KADAI_RECORDS.filter(
      (row) => Number(row.children_id) === Number(selectedChild?.children_id) && Number(row.record_type_id) === Number(recordTypeId),
    ),
    [recordTypeId, selectedChild],
  )

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">児童課題記録一覧</h2>
        <select
          value={recordTypeId}
          onChange={(event) => setRecordTypeId(Number(event.target.value))}
          className="rounded border px-3 py-2 text-sm"
        >
          {DUMMY_RECORD_TYPES.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select>
        <span className="text-sm text-gray-500">{rows.length}件</span>
      </div>

      {!selectedChild ? (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-center text-yellow-800">児童を選択してください</div>
      ) : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">日付</th><th className="px-3 py-2">点数</th><th className="px-3 py-2">ミス数</th><th className="px-3 py-2">メモ1</th><th className="px-3 py-2">メモ2</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.date}</td><td className="px-3 py-2">{row.score}</td><td className="px-3 py-2">{row.mistakes}</td><td className="px-3 py-2">{row.memo1}</td><td className="px-3 py-2">{row.memo2}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="5" className="px-3 py-6 text-center text-gray-500">ダミー記録はありません</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PersonalRecordDummy({ selectedChild }) {
  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-semibold">個人記録（ダミー）</h2>
      <div className="rounded border bg-white p-4 text-sm leading-7 text-gray-700">
        <div><strong>児童:</strong> {selectedChild?.children_name ?? '未選択'}</div>
        <div><strong>日付:</strong> 2026-09-06</div>
        <div><strong>記録:</strong> 活動に落ち着いて参加し、職員の説明を聞いて課題へ取り組めた。</div>
      </div>
    </div>
  )
}

export default function MainPanel({ selectedChild }) {
  const [activeTab, setActiveTab] = useState('ai')

  return (
    <section className="min-w-0" aria-label="メインパネル">
      <div className="flex gap-1 border-b border-gray-300 px-3" role="tablist">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t px-4 py-2 text-sm font-medium ${active ? '-mb-px border border-b-white border-gray-300 bg-white text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="min-w-0 bg-white" role="tabpanel">
        {activeTab === 'ai' && <AiDummy selectedChild={selectedChild} />}
        {activeTab === 'child-kadai' && <KadaiDummy selectedChild={selectedChild} />}
        {activeTab === 'personal-record' && <PersonalRecordDummy selectedChild={selectedChild} />}
      </div>
    </section>
  )
}
