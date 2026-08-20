// src/components/CustomButtonsContext/index.jsx
// ini.json 内のカスタムボタン表示設定を管理

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// 利用可能なアクションをハードコード（features設定を統合）
const AVAILABLE_ACTIONS = [
  {
    id: "individualSupportPlan",
    name: "個別支援計画",
    description: "個別支援計画を表示します",
    category: "支援計画",
    icon: "📋",
    color: "#007bff",
  },
  {
    id: "specializedSupportPlan",
    name: "専門的支援計画",
    description: "専門的支援計画を表示します",
    category: "支援計画",
    icon: "📊",
    color: "#28a745",
  },
  {
    id: "importSetting",
    name: "設定ファイル取得",
    description: "設定ファイルをインポートします",
    category: "設定",
    icon: "📁",
    color: "#6c757d",
  },
  {
    id: "getUrl",
    name: "URL取得",
    description: "現在のURLを取得します",
    category: "ユーティリティ",
    icon: "🔗",
    color: "#17a2b8",
  },
  {
    id: "loadIni",
    name: "設定の再読み込み",
    description: "INI設定を再読み込みします",
    category: "設定",
    icon: "🔄",
    color: "#e5d7fe",
  },
  {
    id: "additionCompare",
    name: "加算比較",
    description: "加算登録の比較機能を実行します",
    category: "比較機能",
    icon: "📊",
    color: "#f9d4fc",
  },
  {
    id: "customAction1",
    name: "キャンセル待ちの登録",
    description: "キャンセル待ちの登録を実行します",
    category: "カスタム",
    icon: "🔧",
    color: "#475569",
  },
];

const CustomButtonsContext = createContext(null)

// ini.jsonには表示状態だけを保存し、表示名・色・実行内容は固定カタログから補完する。
const createButtonConfigs = (savedButtons = []) => {
  const enabledById = new Map(
    savedButtons.map((button) => [button.id, button.enabled === true])
  )

  return AVAILABLE_ACTIONS.map((action, index) => ({
    ...action,
    enabled: enabledById.get(action.id) ?? false,
    text: action.name,
    action: action.id,
    order: index + 1,
  }))
}

const createVisibilityConfig = (buttons) => buttons.reduce((result, button) => {
  result[button.id] = { enabled: button.enabled === true }
  return result
}, {})

export function CustomButtonsProvider({ children }) {
  const [customButtons, setCustomButtons] = useState([])
  // availableActions は固定値を使用（stateから削除）
  const availableActions = AVAILABLE_ACTIONS

  // カスタムボタンの読み込み
  const loadCustomButtons = useCallback(async () => {
    try {
      const result = await window.electronAPI.readIni()
      
      if (!result.success) {
        console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", result.error)
        return false
      }

      const buttons = createButtonConfigs(result.data.customButtons || [])
      setCustomButtons(buttons)
      
      // グローバル設定を更新（buttonVisibility.js用）
      window.__customButtonsConfig = createVisibilityConfig(buttons)
      
      console.log("✅ [CUSTOM_BUTTONS] カスタムボタン読み込み成功:", buttons.length)
      return true
    } catch (err) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", err)
      return false
    }
  }, [])

  // カスタムボタンの保存
  const saveCustomButtons = useCallback(async () => {
    try {
      console.log("🔄 [CUSTOM_BUTTONS] カスタムボタンを保存中...")
      console.log("🔍 [CUSTOM_BUTTONS] 保存するカスタムボタン:", customButtons)
      console.log("🔍 [CUSTOM_BUTTONS] カスタムボタン数:", customButtons.length)
      
      const data = customButtons.map(({ id, enabled }) => ({
        id,
        enabled: enabled === true,
      }))
      
      console.log("🔍 [CUSTOM_BUTTONS] 保存データ:", JSON.stringify(data, null, 2))
      
      const result = await window.electronAPI.updateIniSetting('customButtons', data)
      
      if (!result.success) {
        console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", result.error)
        if (window.showErrorToast) window.showErrorToast("カスタムボタンの保存に失敗しました")
        return false
      }

      // 保存後にグローバル設定を更新
      window.__customButtonsConfig = createVisibilityConfig(customButtons)

      console.log("✅ [CUSTOM_BUTTONS] カスタムボタン保存成功")
      return true
    } catch (err) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", err)
      if (window.showErrorToast) window.showErrorToast("カスタムボタンの保存に失敗しました")
      return false
    }
  }, [customButtons])

  // カスタムボタンの取得（有効なもののみ）
  const getCustomButtons = useCallback(() => {
    return customButtons.filter(btn => btn.enabled)
  }, [customButtons])

  // ボタン設定を取得（ID指定）
  const getButtonConfig = useCallback((buttonId) => {
    const button = customButtons.find(btn => btn.id === buttonId)
    if (!button) {
      console.warn(`⚠️ [CUSTOM_BUTTONS] ボタンが見つかりません: ${buttonId}`)
      return { enabled: false }
    }
    return {
      enabled: button.enabled,
      text: button.text,
      color: button.color,
      action: button.action
    }
  }, [customButtons])

  // 機能が有効かチェック（buttonVisibility.js用）
  const isFeatureEnabled = useCallback((featureName) => {
    const config = getButtonConfig(featureName)
    return config.enabled || false
  }, [getButtonConfig])

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

  // ============================================================
  // 🔧 カスタムボタンの更新（インデックスベース）
  // ============================================================
  // ⚠️ updateCustomButton を先に定義（addCustomButton より前に）
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

  // ============================================================
  // ➕ カスタムボタンの追加
  // ============================================================
  const addCustomButton = useCallback((actionId, text, color) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action) {
      console.error("❌ [CUSTOM_BUTTONS] アクションが見つかりません:", actionId)
      return false
    }

    // 既存のボタンがあるかチェック
    const existingButton = customButtons.find(b => b.id === actionId)
    if (existingButton) {
      console.warn(`⚠️ [CUSTOM_BUTTONS] ボタンは既に存在します: ${actionId}`)
      // 既存のボタンを有効化
      const index = customButtons.indexOf(existingButton)
      return updateCustomButton(index, { enabled: true })
    }

    const newButton = {
      id: actionId,
      enabled: true,
      text: text || action.name,
      color: color || "#007bff",
      action: actionId,
      order: Math.max(...customButtons.map(b => b.order || 0), 0) + 1,
      category: action.category
    }

    setCustomButtons(prev => [...prev, newButton])
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを追加:", newButton)
    return true
  }, [customButtons, availableActions, updateCustomButton]) // ← updateCustomButton を依存に追加

  // ============================================================
  // 🗑️ カスタムボタンの削除（インデックスベース）
  // ============================================================
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

  // ============================================================
  // 🗑️ カスタムボタンの削除（IDベース）
  // ============================================================
  const removeCustomButtonById = useCallback((id) => {
    const index = customButtons.findIndex(btn => btn.id === id)
    if (index >= 0) {
      return removeCustomButton(index)
    }
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id)
    return false
  }, [customButtons, removeCustomButton])

  // ============================================================
  // 🔄 カスタムボタンの更新（IDベース）
  // ============================================================
  const updateCustomButtonById = useCallback((id, updates) => {
    const index = customButtons.findIndex(btn => btn.id === id)
    if (index >= 0) {
      return updateCustomButton(index, { enabled: updates.enabled === true })
    }
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id)
    return false
  }, [customButtons, updateCustomButton])

  // ============================================================
  // 🔀 カスタムボタンの並び替え
  // ============================================================
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

  // ============================================================
  // 🔢 カスタムボタンのorderプロパティを初期化
  // ============================================================
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

  // ============================================================
  // 🚀 初期読み込み
  // ============================================================
  useEffect(() => {
    loadCustomButtons()
  }, [loadCustomButtons])

  // ============================================================
  // 🌐 グローバルAPIとして登録
  // ============================================================
  useEffect(() => {
    window.CustomButtonsState = {
      customButtons,
      availableActions,
      getCustomButtons,
      getButtonConfig,
      isFeatureEnabled,
      loadCustomButtons,
      saveCustomButtons,
      getAvailableActions,
      getActionsByCategory,
      addCustomButton,
      updateCustomButtonById,
      removeCustomButtonById
    }

    // buttonVisibility.js が使用するグローバル関数を設定
    window.IniState = {
      isFeatureEnabled,
      getButtonConfig,
      // 後方互換性のため
      getIniValue: (key) => {
        const config = getButtonConfig(key);
        return config.enabled ? 'true' : 'false';
      }
    };

    return () => {
      delete window.CustomButtonsState
      delete window.IniState
    }
  }, [
    customButtons,
    availableActions,
    getCustomButtons,
    getButtonConfig,
    isFeatureEnabled,
    loadCustomButtons,
    saveCustomButtons,
    getAvailableActions,
    getActionsByCategory,
    addCustomButton,
    updateCustomButtonById,
    removeCustomButtonById
  ])

  // ============================================================
  // 📦 Context Provider
  // ============================================================
  return (
    <CustomButtonsContext.Provider
      value={{
        customButtons,
        availableActions,
        setCustomButtons,
        loadCustomButtons,
        saveCustomButtons,
        getCustomButtons,
        getButtonConfig,
        isFeatureEnabled,
        getAvailableActions,
        getActionsByCategory,
        addCustomButton,
        updateCustomButton,
        updateCustomButtonById,
        removeCustomButton,
        removeCustomButtonById,
        reorderCustomButtons,
        initializeButtonOrders,
        // 後方互換性のため
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
