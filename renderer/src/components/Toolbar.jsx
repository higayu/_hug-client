import { useEffect, useState } from 'react'
import SettingsModal from './settings/SettingsModal.jsx'
import CustomButtonsPanel from './CustomButtonsPanel.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { useAppState } from '../contexts/AppStateContext.jsx'
import { useTabs } from '../hooks/useTabs.js'

function Toolbar() {
  const { showInfoToast } = useToast()
  const { appState } = useAppState()
  const { addPersonalRecordTab, addProfessionalSupportNewTab } = useTabs()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // 設定フォルダーを開く（右クリック）
  const handleOpenConfigFolder = async (e) => {
    e.preventDefault() // デフォルトのコンテキストメニューを防ぐ
    try {
      const result = await window.electronAPI.openConfigFolder()
      if (result.success) {
        showInfoToast(`📁 設定フォルダーを開きました`)
        console.log("✅ 設定フォルダーを開きました:", result.path)
      } else {
        showInfoToast(`❌ 設定フォルダーを開けませんでした: ${result.error}`)
        console.error("❌ 設定フォルダーを開く失敗:", result.error)
      }
    } catch (err) {
      showInfoToast(`❌ 設定フォルダーを開く際にエラーが発生しました`)
      console.error("❌ 設定フォルダーを開くエラー:", err)
    }
  }

  useEffect(() => {
    // Edit-Settingsボタンのイベントリスナーを設定
    const editSettingsBtn = document.getElementById('Edit-Settings')
    const handleClick = () => {
      setIsSettingsModalOpen(true)
    }
    
    if (editSettingsBtn) {
      editSettingsBtn.addEventListener('click', handleClick)
    }

    return () => {
      if (editSettingsBtn) {
        editSettingsBtn.removeEventListener('click', handleClick)
      }
    }
  }, [])

  useEffect(() => {
    // ドロップダウンの位置を動的に計算する関数
    function positionDropdown(button, dropdown) {
      const rect = button.getBoundingClientRect()
      dropdown.style.position = 'fixed'
      dropdown.style.top = (rect.bottom + 5) + 'px'
      dropdown.style.left = rect.left + 'px'
      dropdown.style.zIndex = '99999'
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

  return (
    <div 
      id="toolbar" 
      className="bg-[#616161] text-white p-2 flex-none flex flex-nowrap items-center gap-2.5 overflow-x-auto whitespace-nowrap relative z-[1000]"
    >
      <button 
        id="menuToggle" 
        className="bg-transparent border-none text-white text-xl cursor-pointer mr-2 whitespace-nowrap flex-shrink-0 hover:scale-110 transition-transform"
      >
        <i className="fa-solid fa-bars text-xl text-white min-w-[40px]"></i>
      </button>

      <button 
        id="kojin-kiroku"
        onClick={addPersonalRecordTab}
        className="bg-[#4CAF50] text-white border-none px-3.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all whitespace-nowrap flex-shrink-0 hover:bg-[#66BB6A] hover:scale-105 active:bg-[#43A047] active:scale-[0.97]"
      >
        ＋ 個人記録
      </button>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
        <button 
          id="panel-special-btn" 
          className="bg-[#f8461f] text-white border-none rounded-md px-3 py-1.5 cursor-pointer transition-all whitespace-nowrap relative z-[1002] hover:bg-[#2196f3]"
        >
          💵専門的支援加算 ▾
        </button>
        <div 
          id="panel-special" 
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <ul className="list-none m-0 p-0 py-1.25">
            <li className="m-0 p-0">
              <button 
                id="professional-support-new"
                onClick={addProfessionalSupportNewTab}
                className="block w-full text-left border-none bg-white text-black px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                ＋ 専門的支援-新規
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="professional-support"
                className="block w-full text-left border-none bg-white text-black px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                専門的支援-一覧
              </button>
            </li>
          </ul>
        </div>
      </nav>

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
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <ul className="list-none m-0 p-0 py-1.25">
            <li className="m-0 p-0">
              <button 
                id="Individual_Support_Button"
                className="block w-full text-left border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                個別支援-計画
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Specialized-Support-Plan"
                className="block w-full text-left border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                専門的支援-計画
              </button>
            </li>
          </ul>
        </div>
      </nav>

        {/* 🌟 設定フォルダーを開くボタン（救済措置・右クリック） */}
        <button
          onContextMenu={handleOpenConfigFolder}
          className="flex-shrink-0 p-1.5 rounded transition-colors duration-200  text-white hover:bg-yellow-600"
          title="右クリック: 設定フォルダーを開く（Database設定がずれた時の救済措置）"
        >
          施設:
        </button>

      <select 
        id="facilitySelect" 
        className="js_c_f_id bg-white text-black border border-[#ddd] px-2.5 py-1.5 rounded text-sm cursor-pointer whitespace-nowrap flex-shrink-0 hover:border-gray-400 focus:outline-none focus:border-[#2196f3] focus:ring-2 focus:ring-[rgba(33,150,243,0.2)]"
      >
        <option value="3" defaultChecked>PD吉島</option>
        <option value="6">PD光</option>
        <option value="7">PD横川</option>
        <option value="8">PD五日市駅前</option>
      </select>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="relative inline-block ml-0 min-w-auto flex-shrink-0 z-[1001]">
        <button 
          id="panel-btn" 
          className="bg-[#515152] text-white border-none rounded-md px-3 py-1.5 cursor-pointer transition-all whitespace-nowrap relative z-[1002] hover:bg-[#2196f3]"
        >
          ⚙️設定 ▾
        </button>
        <div 
          id="panel" 
          className="navInner fixed right-auto top-auto bg-white border border-gray-300 rounded-md shadow-lg z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
        >
          <ul className="list-none m-0 p-0 py-1.25">
            <li className="m-0 p-0">
              <button 
                id="loginBtn"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                ⚙️ 自動ログイン
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="refreshBtn"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                🔄 更新
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Get-Url"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                URLの取得
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Edit-Settings"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                ⚙️ 設定編集
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Load-Ini"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                🔄 設定の再読み込み
              </button>
            </li>
            <li className="m-0 p-0">
              <button 
                id="Import-Setting"
                className="block w-full text-left text-black border-none bg-transparent px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
              >
                📁 設定ファイルのインポート
              </button>
            </li>
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

      <label className="toggle-switch relative inline-block w-10 h-[22px] ml-2 align-middle" title="閉じるボタン表示トグル">
        <input 
          type="checkbox" 
          id="closeToggle" 
          defaultChecked 
          className="opacity-0 w-0 h-0"
        />
        <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#ccc] rounded-[22px] transition-all before:content-[''] before:absolute before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full before:transition-all"></span>
      </label>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  )
}

export default Toolbar

