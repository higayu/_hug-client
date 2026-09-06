import { useEffect, useRef, useState } from 'react'

const MENU_ITEMS = [
  {
    id: 'home',
    label: 'ホーム',
    position: 'translate-x-[35px] -translate-y-[120px]',
  },
  {
    id: 'search',
    label: '検索',
    position: 'translate-x-[100px] -translate-y-[85px]',
  },
  {
    id: 'add',
    label: '追加',
    position: 'translate-x-[130px] translate-y-0',
  },
  {
    id: 'edit',
    label: '編集',
    position: 'translate-x-[100px] translate-y-[85px]',
  },
  {
    id: 'settings',
    label: '設定',
    position: 'translate-x-[35px] translate-y-[120px]',
  },
]

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
      fill="currentColor"
    >
      <circle cx="6" cy="6" r="1.8" />
      <circle cx="12" cy="6" r="1.8" />
      <circle cx="18" cy="6" r="1.8" />
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="12" cy="18" r="1.8" />
      <circle cx="18" cy="18" r="1.8" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export default function FanContent() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleItemClick = (item) => {
    console.log('[FanContent] action:', item.id)

    // 各ボタンの実処理はここに追加してください。
    // 例: item.id に応じて画面切替え、IPC呼び出し、モーダル表示など。

    setIsOpen(false)
  }

  return (
    <section className="min-h-[360px] p-4" aria-label="クイック操作">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-800">クイック操作</h2>
        <p className="mt-1 text-xs text-gray-500">
          左のボタンを押すと、操作ボタンが右方向へ展開します。
        </p>
      </div>

      <div
        ref={menuRef}
        className="relative h-[320px] w-[360px] max-w-full overflow-visible"
      >
        <div
          className={`pointer-events-none absolute left-[48px] top-1/2 h-[250px] w-[180px] -translate-y-1/2 origin-left rounded-r-[250px] bg-black/[0.04] transition-all duration-500 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-[0.6] opacity-0'
          }`}
        />

        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`absolute left-5 top-1/2 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-gray-700 shadow-lg transition-all duration-500 ease-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isOpen
                ? `${item.position} pointer-events-auto scale-100 opacity-100`
                : 'pointer-events-none translate-x-0 -translate-y-1/2 scale-[0.4] opacity-0'
            }`}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'クイック操作を閉じる' : 'クイック操作を開く'}
          aria-expanded={isOpen}
          className="absolute left-[10px] top-1/2 z-20 flex h-20 w-20 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900 text-white shadow-xl transition duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </section>
  )
}
