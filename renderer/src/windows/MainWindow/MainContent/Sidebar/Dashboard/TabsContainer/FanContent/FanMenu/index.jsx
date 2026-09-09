import { useEffect, useRef, useState } from 'react'
import { FAN_CONTENT_PANELS, useAppState } from '@/AppStateContext'

export default function FanMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { activeFanContentPanel, setActiveFanContentPanel } = useAppState()

  const menuItems = [
    {
      id: FAN_CONTENT_PANELS.AI_SUPPORT,
      label: 'AI支援',
      position: 'translate-x-[20px] -translate-y-[140px]',
    },
    {
      id: FAN_CONTENT_PANELS.CHILD_KADAI,
      label: '児童課題',
      position: 'translate-x-[100px] -translate-y-[105px]',
    },
    {
      id: FAN_CONTENT_PANELS.PERSONAL_RECORD,
      label: '個人記録',
      position: 'translate-x-[145px] -translate-y-[35px]',
    },
  ]

  const handleMainButtonClick = () => {
    setIsOpen((prev) => !prev)
  }

  const handleItemClick = (item) => {
    console.log('[FanMenu] MainPanel切り替え:', item.id)
    setActiveFanContentPanel(item.id)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + M で FanMenu を開閉
      if (
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === 'm'
      ) {
        event.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // Esc で FanMenu を閉じる
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <div
      ref={menuRef}
      className="pointer-events-none fixed bottom-2 left-2 z-50 h-[250px] w-[260px]"
    >
      {/* 扇形背景 */}
      <div
        className={`
          pointer-events-none
          absolute
          bottom-[15px]
          left-[15px]
          h-[180px]
          w-[190px]
          origin-bottom-left
          rounded-tr-[190px]
          bg-black/[0.04]
          transition-all
          duration-500
          ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      />

      {/* 子ボタン */}
      {menuItems.map((item) => {
        const isActive = activeFanContentPanel === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            aria-pressed={isActive}
            className={`
              absolute
              bottom-[0px]
              left-[0px]
              z-10
              flex
              h-16
              w-16
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-[13px]
              font-semibold
              shadow-lg
              ring-0
              transition-[background-color,color,box-shadow,opacity,transform]
              duration-300
              ease-out

              hover:shadow-xl
              hover:ring-2
              hover:ring-gray-400
              hover:ring-offset-2

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-gray-500
              focus-visible:ring-offset-2

              ${
                isActive
                  ? `
                      bg-gray-900
                      text-white
                      hover:bg-gray-700
                      hover:ring-gray-600
                    `
                  : `
                      bg-white
                      text-gray-700
                      hover:bg-gray-200
                      hover:text-gray-900
                    `
              }

              ${
                isOpen
                  ? `${item.position} pointer-events-auto scale-100 opacity-100`
                  : 'pointer-events-none translate-x-0 translate-y-0 scale-[0.4] opacity-0'
              }
            `}
          >
            {item.label}
          </button>
        )
      })}

      {/* 親ボタン */}
      <button
        type="button"
        onClick={handleMainButtonClick}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
        className={`
          pointer-events-auto
          absolute
          bottom-[0px]
          left-[0px]
          z-20
          flex
          h-12
          w-12
          cursor-pointer
          items-center
          justify-center
          rounded-full
          bg-gray-900
          text-3xl
          text-white
          shadow-xl
          transition-all
          duration-300
          ease-out
          hover:bg-gray-800
          hover:shadow-2xl
          active:scale-95
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        ☰
      </button>
    </div>
  )
}
