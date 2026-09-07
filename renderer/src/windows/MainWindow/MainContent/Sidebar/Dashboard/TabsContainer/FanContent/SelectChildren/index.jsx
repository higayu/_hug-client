import { useEffect, useState } from 'react'
import TodayChildrenList from './TodayChildrenList'
import { DUMMY_CHILDREN } from './dummyData'

export default function SelectChildren({ selectedChildId, onSelectChild }) {
  const [fallbackSelectedChildId, setFallbackSelectedChildId] = useState(
    DUMMY_CHILDREN[0]?.children_id ?? null,
  )

  const controlled = selectedChildId !== undefined
  const currentSelectedChildId = controlled
    ? selectedChildId
    : fallbackSelectedChildId

  const handleSelectChild = (childId) => {
    if (!controlled) {
      setFallbackSelectedChildId(childId)
    }

    onSelectChild?.(childId)
  }

  useEffect(() => {
    console.log('🧰 SelectChildren: ダミーデータモードで起動しました')
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="tool-content flex min-h-0 flex-1 overflow-visible">
        <div className="min-w-0 flex-1">
          <TodayChildrenList
            selectedChildId={currentSelectedChildId}
            onSelectChild={handleSelectChild}
          />
        </div>
      </div>
    </div>
  )
}
