import { useEffect, useState } from 'react'
import SettingsModal from './settings/SettingsModal.jsx'

function Toolbar() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

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
    <div id="toolbar" className="text-white">
      <button id="menuToggle" className="hamburger">
        <i className="fa-solid fa-bars"></i>
      </button>

      <button id="kojin-kiroku">＋ 個人記録</button>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="globalNav">
        <button id="panel-special-btn" className="menu-button-special">💵専門的支援加算 ▾</button>
        <div id="panel-special" className="navInner">
          <ul>
            <li><button id="professional-support-new">＋ 専門的支援-新規</button></li>
            <li><button id="professional-support">専門的支援-一覧</button></li>
          </ul>
        </div>
      </nav>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="globalNav">
        <button id="panel-support-btn" className="menu-button-support">📜支援計画 ▾</button>
        <div id="panel-support" className="navInner">
          <ul>
            <li><button id="Individual_Support_Button">個別支援-計画</button></li>
            <li><button id="Specialized-Support-Plan">専門的支援-計画</button></li>
          </ul>
        </div>
      </nav>

      <label htmlFor="facilitySelect" style={{ marginLeft: '0px' }}>施設:</label>
      <select id="facilitySelect" className="js_c_f_id">
        <option value="3" defaultChecked>PD吉島</option>
        <option value="6">PD光</option>
        <option value="7">PD横川</option>
        <option value="8">PD五日市駅前</option>
      </select>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="globalNav">
        <button id="panel-btn" className="menu-button-setting">⚙️設定 ▾</button>
        <div id="panel" className="navInner">
          <ul>
            <li><button id="loginBtn">⚙️ 自動ログイン</button></li>
            <li><button id="refreshBtn">🔄 更新</button></li>
            <li><button id="Get-Url">URLの取得</button></li>
            <li><button id="Edit-Settings">⚙️ 設定編集</button></li>
            <li><button id="Load-Ini">🔄 設定の再読み込み</button></li>
            <li><button id="Import-Setting">📁 設定ファイルのインポート</button></li>
          </ul>
        </div>
      </nav>

      {/* ======== ナビゲーションメニュー ======== */}
      <nav className="globalNav">
        <button id="custom-btn" className="menu-button-setting">カスタムツール ▾</button>
        <div id="custom-panel" className="navInner">
          <ul></ul>
        </div>
      </nav>

      <label className="toggle-switch" title="閉じるボタン表示トグル">
        <input type="checkbox" id="closeToggle" defaultChecked />
        <span className="slider"></span>
      </label>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  )
}

export default Toolbar

