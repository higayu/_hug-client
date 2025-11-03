// src/hooks/useCustomButtonManager.js
// カスタムボタンマネージャーのフック（後方互換性のため）

import { useEffect, useRef } from 'react'
import { useCustomButtons } from '../contexts/CustomButtonsContext.jsx'

/**
 * カスタムボタンマネージャーのフック
 * 後方互換性のため、init()とreloadCustomButtons()を提供
 */
export function useCustomButtonManager() {
  const { loadCustomButtons, getCustomButtons } = useCustomButtons()
  const initializedRef = useRef(false)

  // 初期化
  const init = async () => {
    if (initializedRef.current) return

    console.log("🔧 カスタムボタンマネージャーを初期化中...")

    // カスタムボタンを読み込み
    await loadCustomButtons()

    // カスタムボタンを取得（使用は任意、コンポーネント側で自動取得される）
    const buttons = getCustomButtons()
    console.log("📋 カスタムボタン設定:", buttons)

    initializedRef.current = true
    console.log("✅ カスタムボタンマネージャー初期化完了")
  }

  // カスタムボタンを再読み込み
  const reloadCustomButtons = async () => {
    console.log("🔄 カスタムボタンを再読み込み中...")
    await loadCustomButtons()
    const buttons = getCustomButtons()
    console.log("✅ カスタムボタンの再読み込み完了:", buttons)
  }

  return {
    init,
    reloadCustomButtons
  }
}

