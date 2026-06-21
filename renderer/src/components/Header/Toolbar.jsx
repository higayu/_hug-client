import { useEffect, useState } from 'react'
import SettingsModal from '@/components/settings/SettingsModal.jsx'
import CustomButtonsPanel from '@/components/common/CustomButtonsPanel/index.jsx'
import { useToast } from  '@/components/common/ToastContext.jsx'
////import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'
import { useTabs } from '@/hooks/useTabs'
import { useHugActions } from '@/hooks/useHugActions'
import { useDispatch, useSelector } from 'react-redux'
import { setFacilityId, selectFacilityId } from '@/store/slices/appStateSlice'
import { ArrowRightOnRectangleIcon,TrashIcon,Cog6ToothIcon,AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import UrlContent from '@/components/common/UrlContent';
import CloseToggleSwitch from '@/components/common/CloseToggleSwitch';
import FacilitySelector from '@/components/facility'
import StaffUpdateButton from '@/components/Header/StaffUpdateButton'
import ProfessionalSupportListButton from '@/components/Header/ProfessionalSupportListButton'

export default function Toolbar() {
  const { showInfoToast } = useToast()
  const { appState,DEBUG_FLG } = useAppState()
  const { clearActiveWebviewCache } = useTabs()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(true)

  const dispatch = useDispatch()
  const facilityId = useSelector(selectFacilityId)

  
  // 各種ボタンのイベントリスナーとハンドラー
  const {
     handleLogin,
     handleGetUrl,
     handleIndividualSupport,
     handleSpecializedSupport
     } = useHugActions()

     const handleClearWebviewCache = async () => {
      const ok = await clearActiveWebviewCache();
      showInfoToast(ok ? "🧹 キャッシュ削除完了！" : "⚠ 削除失敗");
    };



  // 設定編集ボタンのハンドラー
  const handleEditSettings = () => {
    setIsSettingsModalOpen(true)
  }

  useEffect(() => {
    // ドロップダウンの位置を動的に計算する関数
    function positionDropdown(button, dropdown) {
      const rect = button.getBoundingClientRect()
      dropdown.style.position = 'fixed'
      dropdown.style.top = (rect.bottom + 5) + 'px'
      dropdown.style.left = rect.left + 'px'
      dropdown.style.zIndex = '99999'
    }
    if (!facilityId) {
      console.log('',);
      dispatch(setFacilityId("3"))
    }

    // ========= 設定ナビゲーション =====
    const panelBtn = document.getElementById("panel-btn")
    const panel = document.getElementById("panel")

    let handlePanelClick = null
    let handlePanelOutsideClick = null

    if (panelBtn && panel) {
      handlePanelClick = (e) => {
        e.stopPropagation()
        panel.classList.toggle("open")
        if (panel.classList.contains("open")) {
          positionDropdown(panelBtn, panel)
        }
      }

      handlePanelOutsideClick = (e) => {
        if (!panel.contains(e.target) && e.target !== panelBtn) {
          panel.classList.remove("open")
        }
      }

      panelBtn.addEventListener("click", handlePanelClick)
      document.addEventListener("click", handlePanelOutsideClick)
    }

    // ========= 一覧ナビゲーション =====
    const panel_Support_Btn = document.getElementById("panel-support-btn")
    const panel_Support = document.getElementById("panel-support")

    let handleSupportClick = null
    let handleSupportOutsideClick = null

    if (panel_Support_Btn && panel_Support) {
      handleSupportClick = (e) => {
        e.stopPropagation()
        panel_Support.classList.toggle("open")
        if (panel_Support.classList.contains("open")) {
          positionDropdown(panel_Support_Btn, panel_Support)
        }
      }

      handleSupportOutsideClick = (e) => {
        e.stopPropagation()
        if (!panel_Support.contains(e.target) && e.target !== panel_Support_Btn) {
          panel_Support.classList.remove("open")
        }
      }

      panel_Support_Btn.addEventListener("click", handleSupportClick)
      document.addEventListener("click", handleSupportOutsideClick)
    }

    // ========= 専門的支援加算ナビゲーション =====
    const panel_special_Btn = document.getElementById("panel-special-btn")
    const panel_special = document.getElementById("panel-special")

    let handleSpecialClick = null
    let handleSpecialOutsideClick = null

    if (panel_special_Btn && panel_special) {
      handleSpecialClick = (e) => {
        e.stopPropagation()
        panel_special.classList.toggle("open")
        if (panel_special.classList.contains("open")) {
          positionDropdown(panel_special_Btn, panel_special)
        }
      }

      handleSpecialOutsideClick = (e) => {
        e.stopPropagation()
        if (!panel_special.contains(e.target) && e.target !== panel_special_Btn) {
          panel_special.classList.remove("open")
        }
      }

      panel_special_Btn.addEventListener("click", handleSpecialClick)
      document.addEventListener("click", handleSpecialOutsideClick)
    }

    // ========= カスタムツールナビゲーション =====
    const customBtn = document.getElementById("custom-btn")
    const customPanel = document.getElementById("custom-panel")

    let handleCustomClick = null
    let handleCustomOutsideClick = null

    if (customBtn && customPanel) {
      handleCustomClick = (e) => {
        e.stopPropagation()
        customPanel.classList.toggle("open")
        if (customPanel.classList.contains("open")) {
          positionDropdown(customBtn, customPanel)
        }
      }

      handleCustomOutsideClick = (e) => {
        if (!customPanel.contains(e.target) && e.target !== customBtn) {
          customPanel.classList.remove("open")
        }
      }

      customBtn.addEventListener("click", handleCustomClick)
      document.addEventListener("click", handleCustomOutsideClick)
    }

    // ウィンドウリサイズ時にドロップダウンの位置を再計算
    const handleResize = () => {
      if (panel?.classList.contains("open")) {
        positionDropdown(panelBtn, panel)
      }
      if (panel_Support?.classList.contains("open")) {
        positionDropdown(panel_Support_Btn, panel_Support)
      }
      if (panel_special?.classList.contains("open")) {
        positionDropdown(panel_special_Btn, panel_special)
      }
      if (customPanel?.classList.contains("open")) {
        positionDropdown(customBtn, customPanel)
      }
    }

    window.addEventListener("resize", handleResize)

    // クリーンアップ関数
    return () => {
      window.removeEventListener("resize", handleResize)
      
      if (panelBtn && handlePanelClick) {
        panelBtn.removeEventListener("click", handlePanelClick)
      }
      if (handlePanelOutsideClick) {
        document.removeEventListener("click", handlePanelOutsideClick)
      }

      if (panel_Support_Btn && handleSupportClick) {
        panel_Support_Btn.removeEventListener("click", handleSupportClick)
      }
      if (handleSupportOutsideClick) {
        document.removeEventListener("click", handleSupportOutsideClick)
      }

      if (panel_special_Btn && handleSpecialClick) {
        panel_special_Btn.removeEventListener("click", handleSpecialClick)
      }
      if (handleSpecialOutsideClick) {
        document.removeEventListener("click", handleSpecialOutsideClick)
      }

      if (customBtn && handleCustomClick) {
        customBtn.removeEventListener("click", handleCustomClick)
      }
      if (handleCustomOutsideClick) {
        document.removeEventListener("click", handleCustomOutsideClick)
      }
    }
  }, [])

  const handleFacilityChange = (e) => {
    const nextFacilityId = e.target.value
  
    console.log('[facility change]', {
      before: facilityId,
      after: nextFacilityId,
    })
  
    dispatch(setFacilityId(nextFacilityId))
  }
  

  return (
    <div 
      id="toolbar" 
      className="bg-[#616161] text-white flex-none flex flex-nowrap items-center gap-2.5 overflow-x-auto whitespace-nowrap relative z-[1000] pointer-events-auto"
    >
      <ProfessionalSupportListButton />

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
        <button
          id="panel-support-btn" 
          className="bg-[#1976d2] text-white border-none rounded-md px-3 py-1.5 cursor-pointer transition-all whitespace-nowrap relative z-[1002] hover:bg-[#2196f3]"
        >
          📜支援計画 ▾
        </button>
        <div 
          id="panel-support" 
          onClick={(e) => e.stopPropagation()}
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <ul className="list-none m-0 p-0 py-1.25">
            <li className="m-0 p-0">
              <button 
                id="Individual_Support_Button"
                onClick={handleIndividualSupport}
                className="block w-full text-left border-none bg-green-600 px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                個別支援-計画
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Specialized-Support-Plan"
                onClick={handleSpecializedSupport}
                className="block w-full text-left border-none bg-red-600 px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                専門的支援-計画
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
        <button
          id="loginBtn"
          onClick={handleLogin}
          className="
            rounded-full
            flex items-center gap-2
            text-left text-while
            border-none
            px-4 py-2 text-sm
            cursor-pointer transition-colors
            bg-sky-600
            hover:bg-gray-800
          "
          aria-label="自動ログイン"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          <span>Login</span>
        </button>
      </nav>



      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
          <button
            id="panel-btn"
            className="flex items-center gap-2
                      bg-[#515152] text-white border-none rounded-md
                      px-3 py-1.5 text-sm cursor-pointer whitespace-nowrap
                      transition-all relative z-[1002]
                      hover:bg-[#2196f3]"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-white" />
            <span>設定</span>
            <span className="text-xs opacity-80">▾</span>
          </button>
        <div 
          id="panel" 
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <ul className="list-none m-0 p-0 py-1.25">
            <li className="m-0 p-0">
              <button
                id="cash-Clear"
                onClick={handleClearWebviewCache}
                className="flex w-full items-center gap-2 text-left text-white border-none bg-green-600 px-4 py-2 text-sm cursor-pointer transition-all hover:bg-green-900"
              >
                <TrashIcon className="h-4 w-4 text-gray-600" />
                <span>WebViewのキャッシュクリア</span>
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Get-Url"
                onClick={handleGetUrl}
                className="block w-full text-left bg-purple-500 text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                URLの取得
              </button>
            </li>
            <li className="m-0 p-0">
              <StaffUpdateButton />
            </li>
            <li className="m-0 p-0">
              <button
                id="Edit-Settings"
                onClick={handleEditSettings}
                className="flex w-full items-center gap-2 text-left text-black
                          border-none bg-transparent px-4 py-2 text-sm cursor-pointer
                          transition-all hover:bg-gray-400"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
                <span>設定編集</span>
              </button>
            </li>
            {/* ★ DEBUG_FLG が true のときだけ描画 */}
            {DEBUG_FLG  && (
            <li className="m-0 p-0">
              <button
                className="w-full bg-[#515152] text-white border-none rounded-md cursor-pointer transition-all whitespace-nowrap relative z-[1002] hover:bg-[#2196f3]"
                id="devtools"
                onClick={() => window.api.openDevTools()}
              >
                デベロッパー
              </button>
            </li>
            )}
          </ul>
        </div>
      </nav>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
        <button 
          id="custom-btn" 
          className="bg-[#515152] text-white border-none rounded-md px-3 py-1.5 cursor-pointer transition-all whitespace-nowrap relative z-[1002] hover:bg-[#2196f3]"
        >
          カスタムツール ▾
        </button>
        <div 
          id="custom-panel" 
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <CustomButtonsPanel />
        </div>
      </nav>

      <div className='w-full flex flex-col p-1'>
        <UrlContent/>
        <div className='flex flex-row'>
            <CloseToggleSwitch
              checked={showCloseButton}
              onChange={setShowCloseButton}
            />
            {/* 🌟 設定フォルダーを開くボタン（救済措置・右クリック） */}
            <FacilitySelector  />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  )
}
