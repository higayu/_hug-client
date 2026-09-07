import { useEffect, useMemo, useRef, useState } from 'react'
import { DUMMY_CHILDREN } from './dummyData'
import ChildMemoPanel from './ChildMemoPanel'

const TABS = [
  { id: 'normal', label: '通常' },
  { id: 'sometimes', label: '時折' },
  { id: 'temporary', label: '一時' },
  { id: 'waiting', label: '待機' },
  { id: 'experience', label: '体験' },
]

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TodayChildrenList({ selectedChildId, onSelectChild }) {
  const [activeTab, setActiveTab] = useState('normal')
  const [doneChildIds, setDoneChildIds] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)

  const selectedChild = useMemo(
    () =>
      DUMMY_CHILDREN.find(
        (child) => String(child.children_id) === String(selectedChildId),
      ) ?? null,
    [selectedChildId],
  )

  const visibleChildren = useMemo(
    () => DUMMY_CHILDREN.filter((child) => child.category === activeTab),
    [activeTab],
  )

  const selectedStatus = useMemo(() => {
    if (!selectedChild) return '児童が選択されていません'
    if (selectedChild.status === 'absent') return '欠席'
    if (selectedChild.status === 'exited') {
      return selectedChild.leave ? `退室済 ${selectedChild.leave}` : '退室済'
    }
    if (selectedChild.enter) return `入室 ${selectedChild.enter}`
    return '未入室'
  }, [selectedChild])

  const openList = () => {
    if (selectedChild?.category) {
      setActiveTab(selectedChild.category)
    }
    setIsOpen(true)
  }

  const toggleList = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    openList()
  }

  const toggleDone = (childId) => {
    setDoneChildIds((current) =>
      current.includes(childId)
        ? current.filter((id) => id !== childId)
        : [...current, childId],
    )
  }

  const handleSelectChild = (child) => {
    onSelectChild?.(child.children_id)
    setIsOpen(false)
  }

  // 外側クリックで一覧を閉じる
  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  // Ctrl + Space: 開閉 / Esc: 閉じる
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (isTyping) return

      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault()
        setIsOpen((current) => {
          if (!current && selectedChild?.category) {
            setActiveTab(selectedChild.category)
          }
          return !current
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedChild])

  return (
    <div ref={rootRef} className="sidebar-content relative flex-1 px-2 py-1">
      {/* 常時表示: 現在選択中の児童 */}
      <button
        type="button"
        onClick={toggleList}
        aria-expanded={isOpen}
        className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left shadow-sm transition ${
          isOpen
            ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
            : 'border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50/50'
        }`}
      >
        <div className="min-w-0">
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            選択中の児童
          </div>

          {selectedChild ? (
            <>
              <div className="truncate text-sm font-bold text-gray-800">
                {selectedChild.children_id}: {selectedChild.children_name}
                {selectedChild.pc_name ? ` : ${selectedChild.pc_name}` : ''}
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">{selectedStatus}</div>
            </>
          ) : (
            <div className="text-sm text-gray-500">児童を選択してください</div>
          )}
        </div>

        <span className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition group-hover:bg-cyan-100 group-hover:text-cyan-700">
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {/* 操作ヒント */}
      <div className="mt-1 flex justify-end pr-1 text-[10px] text-gray-400">
        Ctrl + Space で開閉 / Esc で閉じる
      </div>

      {/* 展開される児童一覧 */}
      <div
        className={`mt-2 origin-top overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-200 ${
          isOpen
            ? 'pointer-events-auto max-h-[70vh] translate-y-0 opacity-100'
            : 'pointer-events-none max-h-0 -translate-y-1 border-transparent opacity-0 shadow-none'
        }`}
      >
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          <ul className="m-0 list-none p-0">
            {visibleChildren.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-500">
                表示できる児童はいません
              </li>
            )}

            {visibleChildren.map((child) => {
              const selected = String(selectedChildId) === String(child.children_id)
              const done = doneChildIds.includes(child.children_id)
              const absent = child.status === 'absent'
              const exited = child.status === 'exited'

              return (
                <li
                  key={child.children_id}
                  onClick={() => handleSelectChild(child)}
                  className={`my-1 flex cursor-pointer items-center justify-between rounded-md border p-2 transition ${
                    selected
                      ? exited
                        ? 'border-l-4 border-yellow-600 bg-yellow-200 font-bold ring-1 ring-yellow-300'
                        : 'border-l-4 border-cyan-700 bg-cyan-200 font-bold ring-1 ring-cyan-300'
                      : exited
                        ? 'bg-yellow-50 hover:bg-yellow-200'
                        : 'bg-gray-50 hover:bg-gray-200'
                  } ${absent ? 'grayscale opacity-40' : ''}`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm">
                      {child.children_id}: {child.children_name}
                      {child.pc_name ? ` : ${child.pc_name}` : ''}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      {absent
                        ? '欠席'
                        : exited
                          ? `退室済 ${child.leave}`
                          : child.enter
                            ? `入室 ${child.enter}`
                            : '未入室'}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-pressed={done}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleDone(child.children_id)
                    }}
                    className={`ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                      done
                        ? 'border-green-600 bg-green-500 text-white'
                        : 'border-gray-400 bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    済
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="flex-[5] min-w-0">
        <ChildMemoPanel selectedChild={selectedChild} />
      </div>

    </div>
  )
}
