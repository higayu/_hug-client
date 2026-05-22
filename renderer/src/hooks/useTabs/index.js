// renderer/src/hooks/useTabs/index.js
import { useEffect, useCallback, useRef } from 'react'
import { useAppState } from '@/contexts/appState'
import { setActiveWebview } from '@/utils/webview/webviewState.js'
import { activateTab, closeTab, clearActiveWebviewCache } from './common/index.js'
import { addNormalTabAction } from './actions/normal.js'
import { addPersonalRecordTabAction3 } from './actions/personalRecord.js'
import { addProfessionalSupportListAction } from './actions/professionalList.js'
import { addProfessionalSupportNewAction2, addProfessionalSupportCheckAction } from './actions/professionalNew.js'
import { addWebManagerAction, addWebManagerAction_OutWindow } from './actions/WebManager.js'

export function useTabs() {
  const { appState, iniState } = useAppState()
  const tabsInitializedRef = useRef(false)

  const addNormalTab = useCallback(() => {
    addNormalTabAction(appState)
  }, [appState])

  const addPersonalRecordTab = useCallback(() => {
    addPersonalRecordTabAction3(appState)
  }, [appState])

  const addProfessionalSupportListTab = useCallback(() => {
    addProfessionalSupportListAction(appState)
  }, [appState])

  const addProfessionalSupportCheckTab = useCallback(() => {
    addProfessionalSupportCheckAction(appState)
  }, [appState])

  const addProfessionalSupportNewTab = useCallback(() => {
    addProfessionalSupportNewAction2(appState)
  }, [appState])

  const addWebManagerActionTab = useCallback(() => {
    addWebManagerAction(appState, iniState)
  }, [appState, iniState])

  const addWebManagerActionOutWindowTab = useCallback(() => {
    addWebManagerAction_OutWindow(appState, iniState)
  }, [appState, iniState])

  useEffect(() => {
    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    const handleTabClick = (e) => {
      const tab = e.target.closest('button[data-target]')
      if (!tab) return

      activateTab(tab.dataset.target)
    }

    tabsContainer.addEventListener('click', handleTabClick)
    return () => {
      tabsContainer.removeEventListener('click', handleTabClick)
    }
  }, [])

  useEffect(() => {
    if (tabsInitializedRef.current) {
      const addTabBtn = document.getElementById('add-tab-btn')
      if (addTabBtn) {
        const newAddTabBtn = addTabBtn.cloneNode(true)
        addTabBtn.parentNode?.replaceChild(newAddTabBtn, addTabBtn)

        newAddTabBtn.addEventListener('click', addNormalTab)
        newAddTabBtn.addEventListener('contextmenu', (e) => {
          e.preventDefault()
          window.electronAPI.Open_NowDayPage({
            facilityId: appState.FACILITY_ID,
            dateStr: appState.CURRENT_YMD,
          })
        })
      }
      return
    }

    tabsInitializedRef.current = true

    const defaultWebview = document.getElementById('hugview')
    if (defaultWebview) {
      setActiveWebview(defaultWebview)
    }

    const tabsContainer = document.getElementById('tabs')
    if (!tabsContainer) return

    let addTabBtn = document.getElementById('add-tab-btn')
    if (!addTabBtn) {
      addTabBtn = document.createElement('button')
      addTabBtn.id = 'add-tab-btn'
      addTabBtn.textContent = '+'
      addTabBtn.className = 'px-2 py-1 text-white cursor-pointer rounded transition-colors duration-200 hover:bg-[#777] hover:text-white border-none bg-transparent text-black font-bold'
      tabsContainer.appendChild(addTabBtn)
    }

    addTabBtn.addEventListener('click', addNormalTab)

    const handleContextMenu = (e) => {
      e.preventDefault()
      window.electronAPI.Open_NowDayPage({
        facilityId: appState.FACILITY_ID,
        dateStr: appState.CURRENT_YMD,
      })
    }
    addTabBtn.addEventListener('contextmenu', handleContextMenu)

    const kojinButton = document.getElementById('kojin-kiroku')
    if (kojinButton) {
      kojinButton.addEventListener('click', addPersonalRecordTab)
    }

    const professionalSupportBtn = document.getElementById('professional-support')
    if (professionalSupportBtn) {
      professionalSupportBtn.addEventListener('click', addProfessionalSupportListTab)
    }

    return () => {
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
  }, [addNormalTab, addPersonalRecordTab, addProfessionalSupportListTab, appState.FACILITY_ID, appState.CURRENT_YMD])

  return {
    addNormalTab,
    addPersonalRecordTab,
    addProfessionalSupportListTab,
    addProfessionalSupportNewTab,
    addProfessionalSupportCheckTab,
    addWebManagerAction: addWebManagerActionTab,
    addWebManagerAction_OutWindow: addWebManagerActionOutWindowTab,
    activateTab,
    closeTab,
    clearActiveWebviewCache,
  }
}
