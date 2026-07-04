// src/contexts/CustomButtonsContext.jsx
// customButtons.js (config) の機能をReact Contextに移行

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CustomButtonsContext = createContext(null)

export function CustomButtonsProvider({ children }) {
  const [customButtons, setCustomButtons] = useState([])
  const [availableActions, setAvailableActions] = useState([])

  // カスタムボタンの読み込み
  const loadCustomButtons = useCallback(async () => {
    try {

      const result = await window.electronAPI.readCustomButtons()
      
      if (!result.success) {
        console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", result.error)
        return false
      }

      setCustomButtons(result.data.customButtons || [])
      
      return true
    } catch (err) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", err)
      return false
    }
  }, [])

  // 利用可能なアクションの読み込み
  const loadAvailableActions = useCallback(async () => {
    try {
      console.log("🔄 [CUSTOM_BUTTONS] 利用可能なアクションを読み込み中...")
      const result = await window.electronAPI.readAvailableActions()
      
      if (!result.success) {
        console.error("❌ [CUSTOM_BUTTONS] 利用可能なアクション読み込みエラー:", result.error)
        return false
      }

      setAvailableActions(result.data.availableActions || [])
      console.log("✅ [CUSTOM_BUTTONS] 利用可能なアクション読み込み成功:", result.data.availableActions)
      return true
    } catch (err) {
      console.error("❌ [CUSTOM_BUTTONS] 利用可能なアクション読み込みエラー:", err)
      return false
    }
  }, [])

  // カスタムボタンの保存
  const saveCustomButtons = useCallback(async () => {
    try {
      console.log("🔄 [CUSTOM_BUTTONS] カスタムボタンを保存中...")
      console.log("🔍 [CUSTOM_BUTTONS] 保存するカスタムボタン:", customButtons)
      console.log("🔍 [CUSTOM_BUTTONS] カスタムボタン数:", customButtons.length)
      
      const data = {
        version: "1.0.0",
        customButtons: customButtons
      }
      
      console.log("🔍 [CUSTOM_BUTTONS] 保存データ:", JSON.stringify(data, null, 2))
      
      const result = await window.electronAPI.saveCustomButtons(data)
      
      if (!result.success) {
        console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", result.error)
        if (window.showErrorToast) window.showErrorToast("カスタムボタンの保存に失敗しました")
        return false
      }

      console.log("✅ [CUSTOM_BUTTONS] カスタムボタン保存成功")
      return true
    } catch (err) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", err)
      if (window.showErrorToast) window.showErrorToast("カスタムボタンの保存に失敗しました")
      return false
    }
  }, [customButtons])

  // カスタムボタンの取得
  const getCustomButtons = useCallback(() => {
    return customButtons.filter(btn => btn.enabled)
  }, [customButtons])

  // 利用可能なアクションの取得
  const getAvailableActions = useCallback(() => {
    return availableActions
  }, [availableActions])

  // カテゴリ別にアクションをグループ化
  const getActionsByCategory = useCallback(() => {
    const grouped = {}
    availableActions.forEach(action => {
      if (!grouped[action.category]) {
        grouped[action.category] = []
      }
      grouped[action.category].push(action)
    })
    return grouped
  }, [availableActions])

  // カスタムボタンの追加
  const addCustomButton = useCallback((actionId, text, color) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action) {
      console.error("❌ [CUSTOM_BUTTONS] アクションが見つかりません:", actionId)
      return false
    }

    const newButton = {
      id: `custom${Date.now()}`,
      enabled: true,
      text: text || action.name,
      color: color || "#007bff",
      action: actionId,
      order: Math.max(...customButtons.map(b => b.order || 0), 0) + 1
    }

    setCustomButtons(prev => [...prev, newButton])
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを追加:", newButton)
    return true
  }, [customButtons, availableActions])

  // カスタムボタンの更新（インデックスベース）
  const updateCustomButton = useCallback((index, updates) => {
    if (index >= 0 && index < customButtons.length) {
      setCustomButtons(prev => {
        const newButtons = [...prev]
        const button = { ...newButtons[index], ...updates }
        
        // orderプロパティが更新された場合、重複を避けるために調整
        if (updates.hasOwnProperty('order')) {
          const newOrder = updates.order
          if (newOrder && newOrder > 0) {
            newButtons.forEach((otherButton, otherIndex) => {
              if (otherIndex !== index && otherButton.order === newOrder) {
                otherButton.order = otherIndex + 1
              }
            })
          }
        }
        
        newButtons[index] = button
        return newButtons
      })
      
      console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを更新")
      return true
    }
    return false
  }, [customButtons])

  // カスタムボタンの更新（IDベース）
  const updateCustomButtonById = useCallback((id, updates) => {
    const index = customButtons.findIndex(btn => btn.id === id)
    if (index >= 0) {
      return updateCustomButton(index, updates)
    }
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id)
    return false
  }, [customButtons, updateCustomButton])

  // カスタムボタンの削除（インデックスベース）
  const removeCustomButton = useCallback((index) => {
    if (index >= 0 && index < customButtons.length) {
      const removed = customButtons[index]
      setCustomButtons(prev => {
        const newButtons = prev.filter((_, i) => i !== index)
        // 残りのボタンのorderプロパティを再調整
        newButtons.forEach((button, newIndex) => {
          if (button.order === undefined || button.order > removed.order) {
            button.order = newIndex + 1
          }
        })
        return newButtons
      })
      
      console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを削除:", removed)
      return true
    }
    return false
  }, [customButtons])

  // カスタムボタンの削除（IDベース）
  const removeCustomButtonById = useCallback((id) => {
    const index = customButtons.findIndex(btn => btn.id === id)
    if (index >= 0) {
      return removeCustomButton(index)
    }
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id)
    return false
  }, [customButtons, removeCustomButton])

  // カスタムボタンの並び替え
  const reorderCustomButtons = useCallback((fromIndex, toIndex) => {
    if (fromIndex >= 0 && fromIndex < customButtons.length &&
        toIndex >= 0 && toIndex < customButtons.length) {
      setCustomButtons(prev => {
        const newButtons = [...prev]
        const [moved] = newButtons.splice(fromIndex, 1)
        newButtons.splice(toIndex, 0, moved)
        
        // orderプロパティを更新
        newButtons.forEach((button, index) => {
          button.order = index + 1
        })
        
        return newButtons
      })
      
      console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを並び替え")
      return true
    }
    return false
  }, [customButtons])

  // カスタムボタンのorderプロパティを初期化
  const initializeButtonOrders = useCallback(() => {
    setCustomButtons(prev => {
      const newButtons = prev.map((button, index) => ({
        ...button,
        order: button.order || index + 1
      }))
      return newButtons
    })
    console.log("✅ [CUSTOM_BUTTONS] ボタンのorderプロパティを初期化")
  }, [])

  // 初期読み込み
  useEffect(() => {
    loadCustomButtons()
    loadAvailableActions()
  }, [loadCustomButtons, loadAvailableActions])

  // グローバルAPIとして登録（modules側からの後方互換性のため）
  useEffect(() => {
    // modules側のCustomButtonsStateと同期（後方互換性のため）
    window.CustomButtonsState = {
      customButtons: customButtons,
      availableActions: availableActions,
      getCustomButtons,
      loadCustomButtons,
      loadAvailableActions,
      saveCustomButtons,
      getAvailableActions,
      getActionsByCategory,
      addCustomButton,
      updateCustomButtonById,
      removeCustomButtonById
    }

    return () => {
      delete window.CustomButtonsState
    }
  }, [customButtons, availableActions, getCustomButtons, loadCustomButtons, loadAvailableActions, saveCustomButtons, getAvailableActions, getActionsByCategory, addCustomButton, updateCustomButtonById, removeCustomButtonById])

  return (
    <CustomButtonsContext.Provider
      value={{
        customButtons,
        availableActions,
        setCustomButtons,
        setAvailableActions,
        loadCustomButtons,
        loadAvailableActions,
        saveCustomButtons,
        getCustomButtons,
        getAvailableActions,
        getActionsByCategory,
        addCustomButton,
        updateCustomButton,
        updateCustomButtonById,
        removeCustomButton,
        removeCustomButtonById,
        reorderCustomButtons,
        initializeButtonOrders,
        // 後方互換性のため、CustomButtonsStateとしてもアクセス可能
        CustomButtonsState: {
          customButtons,
          availableActions
        }
      }}
    >
      {children}
    </CustomButtonsContext.Provider>
  )
}

export function useCustomButtons() {
  const context = useContext(CustomButtonsContext)
  if (!context) {
    throw new Error('useCustomButtons must be used within a CustomButtonsProvider')
  }
  return context
}

