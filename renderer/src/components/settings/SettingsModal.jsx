import { useState, useEffect } from 'react'
import './SettingsModal.css'
import { useSettingsModal } from '../../hooks/useSettingsModal.js'
import { useSettingsModalLogic } from '../../hooks/useSettingsModalLogic.js'
import FeaturesTab from './tabs/FeaturesTab'
import ConfigTab from './tabs/ConfigTab'
import UITab from './tabs/UITab'
import WindowTab from './tabs/WindowTab'
import CustomTab from './tabs/CustomTab'
import UpdateTab from './tabs/UpdateTab'

const TABS = [
  { id: 'features', label: '機能設定' },
  { id: 'ui', label: 'UI設定' },
  { id: 'window', label: 'ウィンドウ設定' },
  { id: 'config', label: 'Config.json設定' },
  { id: 'custom', label: 'カスタムボタン' },
  { id: 'update', label: 'アップデート' }
]

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('features')
  const { isLoading } = useSettingsModal(isOpen)
  const {
    populateForm,
    saveSettings,
    resetSettings,
    togglePasswordVisibility,
    saveConfigFromForm,
    initializeSelectBoxes
  } = useSettingsModalLogic(isOpen)

  // モーダルが開かれた時にフォームに値を設定し、セレクトボックスを初期化
  useEffect(() => {
    if (!isOpen) return

    const initializeModal = async () => {
      // 少し遅延させてDOMが確実に存在するようにする
      await new Promise(resolve => setTimeout(resolve, 100))
      populateForm()
      await initializeSelectBoxes()
    }

    initializeModal()
  }, [isOpen, populateForm, initializeSelectBoxes])

  // パスワード表示切替えボタンのイベントリスナー
  useEffect(() => {
    if (!isOpen) return

    const toggleBtn = document.getElementById('toggle-password')
    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePasswordVisibility)
    }

    return () => {
      if (toggleBtn) {
        toggleBtn.removeEventListener('click', togglePasswordVisibility)
      }
    }
  }, [isOpen, togglePasswordVisibility])

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // 保存ボタンのハンドラー
  const handleSave = async () => {
    const success = await saveSettings()
    if (success) {
      onClose()
    }
  }

  // リセットボタンのハンドラー
  const handleReset = () => {
    resetSettings()
  }

  // モーダル外クリックで閉じる
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white m-[2%] mx-auto rounded-xl w-[90%] max-w-[800px] max-h-[90vh] overflow-hidden shadow-2xl animate-modal-slide-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-5 flex justify-between items-center">
          <h2 className="m-0 text-2xl font-semibold">⚙️ 設定編集</h2>
          <span 
            className="text-white text-3xl font-bold cursor-pointer transition-opacity hover:opacity-70" 
            onClick={onClose}
          >
            &times;
          </span>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="flex border-b-2 border-gray-200 mb-5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`bg-transparent border-none px-5 py-3 cursor-pointer text-sm font-medium border-b-[3px] transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-blue-600 bg-gray-100' 
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={activeTab === 'features' ? 'block' : 'hidden'}>
            <FeaturesTab />
          </div>
          <div className={activeTab === 'ui' ? 'block' : 'hidden'}>
            <UITab />
          </div>
          <div className={activeTab === 'window' ? 'block' : 'hidden'}>
            <WindowTab />
          </div>
          <div className={activeTab === 'config' ? 'block' : 'hidden'}>
            <ConfigTab 
              onSaveConfig={saveConfigFromForm}
              onReloadConfig={async () => {
                await initializeSelectBoxes()
                populateForm()
              }}
            />
          </div>
          <div className={activeTab === 'custom' ? 'block' : 'hidden'}>
            <CustomTab />
          </div>
          <div className={activeTab === 'update' ? 'block' : 'hidden'}>
            <UpdateTab />
          </div>
        </div>

        <div className="bg-gray-100 p-4 flex justify-end gap-2.5 border-t border-gray-200">
          <button 
            id="save-settings"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg" 
            onClick={handleSave}
          >
            保存
          </button>
          <button 
            id="cancel-settings"
            className="bg-gray-600 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5" 
            onClick={onClose}
          >
            キャンセル
          </button>
          <button 
            id="reset-settings"
            className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none px-3 py-1.5 rounded cursor-pointer font-medium transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:-translate-y-0.5" 
            onClick={handleReset}
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

