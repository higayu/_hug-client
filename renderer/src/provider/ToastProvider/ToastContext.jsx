// src/components/common/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Toast from './Toast.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000, options = {}) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      message,
      type,
      duration,
      title: options.title,
      details: options.details
    }
    
    setToasts(prev => [...prev, newToast])
    
    // 自動削除はToastコンポーネント内で処理
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 便利関数
  const showSuccessToast = useCallback((message, duration = 3000) => {
    return showToast(message, 'success', duration)
  }, [showToast])

  const showErrorToast = useCallback((message, duration = 4000) => {
    return showToast(message, 'error', duration)
  }, [showToast])

  const showWarningToast = useCallback((message, duration = 3500) => {
    return showToast(message, 'warning', duration)
  }, [showToast])

  const showInfoToast = useCallback((message, duration = 3000) => {
    return showToast(message, 'info', duration)
  }, [showToast])

  const showResultToast = useCallback(({
    title = '処理結果',
    message,
    details,
    success = true,
    duration = 5000
  }) => {
    return showToast(
      message,
      success ? 'success' : 'error',
      duration,
      { title, details }
    )
  }, [showToast])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const toastFunctions = {
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showResultToast,
    clearAllToasts
  }

  // グローバルAPIとして登録（modules側からの後方互換性のため）
  useEffect(() => {
    window.showToast = showToast
    window.showSuccessToast = showSuccessToast
    window.showErrorToast = showErrorToast
    window.showWarningToast = showWarningToast
    window.showInfoToast = showInfoToast
    window.showResultToast = showResultToast
    window.clearAllToasts = clearAllToasts
    
    return () => {
      // クリーンアップ
      delete window.showToast
      delete window.showSuccessToast
      delete window.showErrorToast
      delete window.showWarningToast
      delete window.showInfoToast
      delete window.showResultToast
      delete window.clearAllToasts
    }
  }, [showToast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast, showResultToast, clearAllToasts])

  return (
    <ToastContext.Provider value={toastFunctions}>
      {children}
      {/* トーストを表示 */}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000, pointerEvents: 'none', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            style={{ 
              pointerEvents: 'auto'
            }}
          >
            <Toast
              message={toast.message}
              title={toast.title}
              details={toast.details}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

