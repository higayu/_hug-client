import { useMemo, useState } from 'react'
import SelectChildren from './SelectChildren'
import MainPanel from './MainPanel'
import FanMenu from './FanMenu'
import { DUMMY_CHILDREN } from './SelectChildren/dummyData'

export default function FanContent() {
  const [selectedChildId, setSelectedChildId] = useState(
    DUMMY_CHILDREN[0]?.children_id ?? null,
  )

  const selectedChild = useMemo(
    () =>
      DUMMY_CHILDREN.find(
        (child) => String(child.children_id) === String(selectedChildId),
      ) ?? null,
    [selectedChildId],
  )

  return (
    <section
      className="flex h-full min-h-0 min-w-0 gap-3 overflow-hidden p-2"
      aria-label="児童選択とメインパネル"
    >
      {/* 左: 児童選択 */}
      <div className="relative w-[340px] min-w-[280px] max-w-[420px] shrink-0 overflow-visible">
        <SelectChildren
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
        />

        {/* 左下の空き領域にFanMenuを配置 */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-30">
          <FanMenu />
        </div>
      </div>

      {/* 右: 選択児童に連動するメインパネル */}
      <div className="min-w-0 flex-1 overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <MainPanel selectedChild={selectedChild} />
      </div>
    </section>
  )
}
