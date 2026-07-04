import { useAppState } from '@/AppStateContext'

export default function SelectChildFilter() {
  const {
    SELECT_CHILD_FILTER_MODE,
    setSelectChildFilterMode,
  } = useAppState()

  return (
    <div>
      <select
        className="p-1 border border-gray-300 rounded text-sm bg-white text-black"
        value={String(SELECT_CHILD_FILTER_MODE ?? 0)}
        onChange={(e) => setSelectChildFilterMode(Number(e.target.value))}
      >
        <option value="0">全件表示</option>
        <option value="1">欠席を除く</option>
        <option value="2">欠席・午前を除く</option>
        <option value="3">欠席・午前・退室済みを除く</option>
      </select>
    </div>
  )
}