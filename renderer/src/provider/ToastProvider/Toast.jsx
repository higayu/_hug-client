// src/components/common/Toast.jsx
import { useCallback, useEffect, useState } from 'react'
import { COLORS } from '@/utils/app/constants.js'

const TOAST_COLORS = {
  success: COLORS.SUCCESS,
  error: COLORS.DANGER,
  warning: COLORS.WARNING,
  info: COLORS.PRIMARY
}

const TOAST_LABELS = {
  success: '完了',
  error: 'エラー',
  warning: '確認',
  info: 'お知らせ'
}

function Toast({
  message,
  title,
  details,
  type = 'info',
  duration = 3000,
  onClose
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    // 表示アニメーション
    const visibleTimer = setTimeout(() => setIsVisible(true), 10)

    // 自動非表示
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(visibleTimer)
      clearTimeout(timer)
    }
  }, [duration, handleClose])

  if (!message && !title && !details) return null

  const bgColor = TOAST_COLORS[type] || TOAST_COLORS.info
  const textColor = type === 'warning' ? '#000' : '#fff'
  const detailText = Array.isArray(details)
    ? details.filter(Boolean).join('\n')
    : details

  return (
    <div
      className="toast"
      style={{
        background: bgColor,
        color: textColor,
        padding: '12px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px',
        fontWeight: 500,
        width: '360px',
        maxWidth: 'calc(100vw - 40px)',
        wordWrap: 'break-word',
        opacity: isVisible && !isExiting ? 1 : 0,
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease',
        whiteSpace: 'pre-line'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-bold">
            {title || TOAST_LABELS[type] || TOAST_LABELS.info}
          </div>

          {message && (
            <div className="mt-1 font-medium">{message}</div>
          )}

          {detailText && (
            <div className="mt-2 max-h-48 overflow-auto border-t border-white/30 pt-2 text-xs font-normal opacity-90">
              {detailText}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded px-1 text-lg leading-none opacity-70 hover:opacity-100"
          aria-label="通知を閉じる"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast

