import { useState, useEffect, useCallback } from 'react'
import {
  CustomButtonsState,
  getAvailableActions,
  getActionsByCategory,
  addCustomButton,
  updateCustomButton,
  removeCustomButton,
  saveCustomButtons,
  loadCustomButtons,
  loadAvailableActions
} from '../../../../modules/config/customButtons.js'
import { showSuccessToast, showErrorToast } from '../../../../modules/ui/toast/toast.js'

function CustomTab() {
  const [buttons, setButtons] = useState([])
  const [availableActions, setAvailableActions] = useState([])
  const [newButton, setNewButton] = useState({
    action: '',
    text: '',
    color: '#007bff'
  })

  // カスタムボタンとアクションを読み込み
  const loadData = useCallback(async () => {
    // データを再読み込み
    await loadCustomButtons()
    await loadAvailableActions()
    
    // 状態を更新
    setButtons([...CustomButtonsState.customButtons])
    setAvailableActions(getAvailableActions())
    console.log('✅ [CustomTab] データを読み込みました:', {
      buttons: CustomButtonsState.customButtons.length,
      actions: getAvailableActions().length
    })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // アクションセレクトボックスのオプションを更新
  useEffect(() => {
    const select = document.getElementById('new-button-action')
    if (!select) return

    // 既存のオプションをクリア（最初のオプション以外）
    while (select.children.length > 1) {
      select.removeChild(select.lastChild)
    }

    // 利用可能なアクションを追加
    const actionsByCategory = getActionsByCategory()
    Object.keys(actionsByCategory).forEach(category => {
      const optgroup = document.createElement('optgroup')
      optgroup.label = category
      
      actionsByCategory[category].forEach(action => {
        const option = document.createElement('option')
        option.value = action.id
        option.textContent = `${action.icon || ''} ${action.name}`
        optgroup.appendChild(option)
      })
      
      select.appendChild(optgroup)
    })
  }, [availableActions])

  // ボタンの更新ハンドラー
  const handleButtonUpdate = useCallback((index, field, value) => {
    const updates = { [field]: value }
    const updated = updateCustomButton(index, updates)
    if (updated) {
      loadData()
    }
  }, [loadData])

  // ボタンの削除ハンドラー
  const handleButtonDelete = useCallback((index) => {
    if (confirm('このカスタムボタンを削除しますか？')) {
      const removed = removeCustomButton(index)
      if (removed) {
        showSuccessToast('カスタムボタンを削除しました')
        loadData()
      }
    }
  }, [loadData])

  // 新しいカスタムボタンを作成
  const handleCreateButton = useCallback(async () => {
    if (!newButton.action) {
      showErrorToast('アクションを選択してください')
      return
    }

    const success = addCustomButton(newButton.action, newButton.text, newButton.color)
    if (success) {
      showSuccessToast('カスタムボタンを作成しました')
      setNewButton({ action: '', text: '', color: '#007bff' })
      
      // フォームをリセット
      const actionSelect = document.getElementById('new-button-action')
      const textInput = document.getElementById('new-button-text')
      const colorInput = document.getElementById('new-button-color')
      
      if (actionSelect) actionSelect.value = ''
      if (textInput) textInput.value = ''
      if (colorInput) colorInput.value = '#007bff'
      
      loadData()
    } else {
      showErrorToast('カスタムボタンの作成に失敗しました')
    }
  }, [newButton, loadData])

  // 作成ボタンのイベントリスナー
  useEffect(() => {
    const createBtn = document.getElementById('create-custom-button')
    if (!createBtn) return

    createBtn.addEventListener('click', handleCreateButton)

    return () => {
      createBtn.removeEventListener('click', handleCreateButton)
    }
  }, [handleCreateButton])

  // フォーム入力の更新
  useEffect(() => {
    const actionSelect = document.getElementById('new-button-action')
    const textInput = document.getElementById('new-button-text')
    const colorInput = document.getElementById('new-button-color')

    const updateNewButton = () => {
      setNewButton({
        action: actionSelect?.value || '',
        text: textInput?.value || '',
        color: colorInput?.value || '#007bff'
      })
    }

    if (actionSelect) {
      actionSelect.addEventListener('change', updateNewButton)
    }
    if (textInput) {
      textInput.addEventListener('input', updateNewButton)
    }
    if (colorInput) {
      colorInput.addEventListener('change', updateNewButton)
    }

    return () => {
      if (actionSelect) actionSelect.removeEventListener('change', updateNewButton)
      if (textInput) textInput.removeEventListener('input', updateNewButton)
      if (colorInput) colorInput.removeEventListener('change', updateNewButton)
    }
  }, [])

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">カスタムボタン</h3>
      <p className="mb-4 text-gray-600">
        カスタムボタンは自由に追加・編集・削除できます。<br />
        加算比較ボタンもここで管理されます。
      </p>
      
      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">新しいカスタムボタンを作成</h4>
        <div className="flex gap-2.5 items-end mb-4">
          <div className="flex-1">
            <label className="block mb-1.5 font-bold text-gray-700">アクション:</label>
            <select id="new-button-action" className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
              <option value="">アクションを選択してください</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1.5 font-bold text-gray-700">テキスト:</label>
            <input 
              type="text" 
              id="new-button-text" 
              placeholder="ボタンのテキスト" 
              className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" 
            />
          </div>
          <div className="w-20">
            <label className="block mb-1.5 font-bold text-gray-700">カラー:</label>
            <input 
              type="color" 
              id="new-button-color" 
              defaultValue="#007bff" 
              className="w-full h-10 border border-gray-300 rounded cursor-pointer" 
            />
          </div>
          <div>
            <button 
              id="create-custom-button" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 h-10 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg"
            >
              作成
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">既存のカスタムボタン</h4>
        <div id="custom-buttons-list" className="mb-6">
          {(() => {
            // orderでソート
            const sortedButtons = [...buttons].sort((a, b) => (a.order || 0) - (b.order || 0))
            
            if (sortedButtons.length === 0) {
              return <p className="text-gray-500 text-center py-4">カスタムボタンがありません</p>
            }
            
            return sortedButtons.map((button) => {
              const actualIndex = buttons.findIndex(b => b.id === button.id)
              return (
                <div key={button.id} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-600"
                      checked={button.enabled || false}
                      onChange={(e) => handleButtonUpdate(actualIndex, 'enabled', e.target.checked)}
                    />
                    <span className="font-medium text-gray-700">有効</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block mb-1.5 font-bold text-sm text-gray-700">アクション:</label>
                      <select
                        className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        value={button.action || ''}
                        onChange={(e) => handleButtonUpdate(actualIndex, 'action', e.target.value)}
                      >
                        {availableActions.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.icon || ''} {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1.5 font-bold text-sm text-gray-700">テキスト:</label>
                      <input
                        type="text"
                        className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        value={button.text || ''}
                        onChange={(e) => handleButtonUpdate(actualIndex, 'text', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 font-bold text-sm text-gray-700">カラー:</label>
                      <input
                        type="color"
                        className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        value={button.color || '#007bff'}
                        onChange={(e) => handleButtonUpdate(actualIndex, 'color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none px-4 py-2 rounded-md cursor-pointer font-medium text-sm transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:-translate-y-0.5"
                      onClick={() => handleButtonDelete(actualIndex)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}

export default CustomTab

