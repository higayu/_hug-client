import { useEffect } from 'react'
import TodayChildrenList from './TodayChildrenList'

export default function SelectChildren() {
  useEffect(() => {
    console.log('🧰 FanContent SelectChildren: 実データモードで起動しました')
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="tool-content flex min-h-0 flex-1 overflow-visible">
        <div className="min-w-0 flex-1">
          <TodayChildrenList />
        </div>
      </div>
    </div>
  )
}
