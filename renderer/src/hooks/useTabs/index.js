//renderer\src\hooks\useTabs\index.js
// タブ管理のフック
import { useEffect, useCallback, useRef } from 'react'
import { useAppState } from '@/contexts/AppStateContext.jsx'
import { setActiveWebview } from '@/utils/webviewState.js'
import { getDateString } from '@/utils/dateUtils.js'
import { createWebview, createTabButton, activateTab, closeTab,clearActiveWebviewCache } from './common/index.js'
import { addNormalTabAction } from './actions/normal.js'
import { addPersonalRecordTabAction3 } from './actions/personalRecord.js'
import { addProfessionalSupportListAction } from './actions/professionalList.js'
import { addProfessionalSupportNewAction } from './actions/professionalNew.js'
import { addWebManagerAction } from './actions/WebManager.js'
import { useIniState } from '@/contexts/IniStateContext.jsx'

/**
 * タブ管理のフック
 */
export function useTabs() {
  const { appState } = useAppState()
  const tabsInitializedRef = useRef(false)
  const { iniState } = useIniState()   // ← ★ これを追加

    // ラッパーとして最小限にする
    // 通常タブ追加
    const addNormalTab = useCallback(() => {
      addNormalTabAction(appState)
    }, [appState])

    // 個人記録タブ追加
    const addPersonalRecordTab = useCallback(() => {
      addPersonalRecordTabAction3(appState)
    }, [appState])

    // 専門的支援一覧タブ追加
    const addProfessionalSupportListTab = useCallback(() => {
      addProfessionalSupportListAction(appState)
    }, [appState])

    // 専門的支援-新規タブ追加
    const addProfessionalSupportNewTab = useCallback(() => {
      addProfessionalSupportNewAction(appState)
    }, [appState])

    // 管理webアプリ
    const addWebManagerActionTab = useCallback(() => {
      addWebManagerAction(appState, iniState) // ← ✔ 引数で渡す
    }, [appState, iniState])

  // タブ切り替えイベントの設定
  useEffect(() => {
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    const handleTabClick = (e) => {
      const tab = e.target.closest('button[data-target]')
      if (!tab) return
    
      const targetId = tab.dataset.target
    
      if (tab.id === 'hugview-first-button') {
        console.log('Hugタブがクリックされました')
      } else if (tab.id === 'other-tab') {
        console.log('別のタブがクリックされました')
      }
      
      console.log('🎯 data-target:', targetId)
    
      activateTab(targetId)
    }
    

    tabsContainer.addEventListener('click', handleTabClick)

    return () => {
      tabsContainer.removeEventListener('click', handleTabClick)
    }
  }, [])

  // 初期化（一度だけ実行）
  useEffect(() => {
    if (tabsInitializedRef.current) {
      // 初期化済みの場合、追加ボタンのイベントリスナーのみ更新
      const addTabBtn = document.getElementById('add-tab-btn')
      if (addTabBtn) {
        // 既存のイベントリスナーを削除
        const newAddTabBtn = addTabBtn.cloneNode(true)
        addTabBtn.parentNode?.replaceChild(newAddTabBtn, addTabBtn)
        
        // 新しいイベントリスナーを追加
        newAddTabBtn.addEventListener('click', addNormalTab)
        newAddTabBtn.addEventListener('contextmenu', (e) => {
          e.preventDefault()
          window.electronAPI.Open_NowDayPage({
            facilityId: appState.FACILITY_ID,
            dateStr: appState.DATE_STR,
          })
        })
      }
      return
    }
    tabsInitializedRef.current = true

    // 初期アクティブwebview設定
    const defaultWebview = document.getElementById('hugview')
    if (defaultWebview) {
      setActiveWebview(defaultWebview)
    }

    // 追加ボタンのイベントリスナー設定
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    // 追加ボタンを探す（IDで確実に取得）
    let addTabBtn = document.getElementById('add-tab-btn')
    if (!addTabBtn) {
      // 追加ボタンが存在しない場合は作成
      addTabBtn = document.createElement('button')
      addTabBtn.id = 'add-tab-btn'
      addTabBtn.textContent = '＋'
      addTabBtn.className = 'px-2 py-1 text-white cursor-pointer rounded transition-colors duration-200 hover:bg-[#777] hover:text-white border-none bg-transparent text-black font-bold'
      tabsContainer.appendChild(addTabBtn)
    }

    // 通常タブ追加イベント
    addTabBtn.addEventListener('click', addNormalTab)

    // 通常タブの右クリックイベント
    const handleContextMenu = (e) => {
      e.preventDefault()
      window.electronAPI.Open_NowDayPage({
        facilityId: appState.FACILITY_ID,
        dateStr: appState.DATE_STR,
      })
    }
    addTabBtn.addEventListener('contextmenu', handleContextMenu)

    // 個人記録ボタンのイベントリスナー設定
    const kojinButton = document.getElementById('kojin-kiroku')
    if (kojinButton) {
      kojinButton.addEventListener('click', addPersonalRecordTab)
    }

    // 専門的支援ボタンのイベントリスナー設定
    const professionalSupportBtn = document.getElementById('professional-support')
    if (professionalSupportBtn) {
      professionalSupportBtn.addEventListener('click', addProfessionalSupportListTab)
    }

    // 専門的支援-新規ボタンは既にToolbarで処理されているので、ここでは設定不要

    console.log('✅ タブ機能 初期化完了')

    return () => {
      // クリーンアップ（必要に応じて）
      if (addTabBtn) {
        addTabBtn.removeEventListener('click', addNormalTab)
        addTabBtn.removeEventListener('contextmenu', handleContextMenu)
      }
      if (kojinButton) {
        kojinButton.removeEventListener('click', addPersonalRecordTab)
      }
      if (professionalSupportBtn) {
        professionalSupportBtn.removeEventListener('click', addProfessionalSupportListTab)
      }
    }
  }, [addNormalTab, addPersonalRecordTab, addProfessionalSupportListTab, addWebManagerActionTab, appState.FACILITY_ID, appState.DATE_STR])

  return {
    addNormalTab,
    addPersonalRecordTab,
    addProfessionalSupportListTab,
    addProfessionalSupportNewTab,
    addWebManagerAction: addWebManagerActionTab,
    activateTab,
    closeTab,
    clearActiveWebviewCache
  }
}
