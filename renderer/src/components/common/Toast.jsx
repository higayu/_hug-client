// src/components/common/Toast.jsx
import { useEffect, useState } from 'react'
import { COLORS } from '@/utils/constants.js'

const TOAST_COLORS = {
  success: COLORS.SUCCESS,
  error: COLORS.DANGER,
  warning: COLORS.WARNING,
  info: COLORS.PRIMARY
}

function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // 表示アニメーション
    setTimeout(() => setIsVisible(true), 10)

    // 自動非表示
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  if (!message) return null

  const bgColor = TOAST_COLORS[type] || TOAST_COLORS.info
  const textColor = type === 'warning' ? '#000' : '#fff'

  return (
    <div
      className="toast"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: textColor,
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        fontSize: '14px',
        fontWeight: 500,
        maxWidth: '300px',
        wordWrap: 'break-word',
        cursor: 'pointer',
        opacity: isVisible && !isExiting ? 1 : 0,
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease',
        whiteSpace: 'pre-line'
      }}
    >
      {message}
    </div>
  )
}

export default Toast

