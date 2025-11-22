// src/components/Tabs.jsx
// タブコンポーネント

import { useEffect } from 'react'
import { useTabs } from '../hooks/useTabs'

function Tabs() {
  useTabs() // タブ機能の初期化

  // 初期アクティブタブの設定
  useEffect(() => {
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    // デフォルトのHugタブをアクティブにする
    const defaultTab = tabsContainer.querySelector('button[data-target="hugview"]')
    if (defaultTab && !defaultTab.classList.contains('active-tab')) {
      defaultTab.classList.add('active-tab')
    }
  }, [])

  return (
    <div id="tabs" className="bg-[#555] p-1 flex-none">
      <button 
        id="hugview-first-button"
        data-target="hugview" 
        className="active-tab mr-1 px-2.5 py-1 border-none cursor-pointer bg-[#777] text-black rounded font-bold shadow-sm"
      >
        今日の利用者
      </button>
      {/* 追加ボタンはuseTabsフック内で動的に追加される */}
    </div>
  )
}

export default Tabs
