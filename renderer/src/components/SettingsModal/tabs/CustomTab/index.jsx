/*
  AVAILABLE_ACTIONS	
  機能のカタログ	
  変更	コード修正が必要	
  保存場所	コード内（Context）	
  関係 元データから選択して作成

  customButtons.json
  ユーザーの設定 ユーザーが自由に編集可能 ファイル（JSON）
*/

import {
  useMemo,
  useState,
} from 'react'

// ✅ インポートパスを修正
import { useCustomButtons } from '@/components/CustomButtonsContext'
import { useToast } from '@/components/common/ToastContext.jsx'

const DEFAULT_BUTTON = {
  action: '',
  text: '',
  color: '#007bff',
}

function CustomTab() {
  const [newButton, setNewButton] = useState(DEFAULT_BUTTON)
  const [isSaving, setIsSaving] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  const {
    customButtons = [],
    availableActions = [],
    addCustomButton,
    updateCustomButtonById,
    removeCustomButtonById,
    saveCustomButtons,
    loadCustomButtons,
  } = useCustomButtons()

  const {
    showSuccessToast,
    showErrorToast,
  } = useToast()

  const sortedButtons = useMemo(() => {
    return [...customButtons].sort(
      (first, second) => {
        return (Number(first?.order ?? 0) - Number(second?.order ?? 0))
      }
    )
  }, [customButtons])

  const actionsByCategory = useMemo(() => {
    return availableActions.reduce((result, action) => {
      const category = action?.category || 'その他'
      if (!result[category]) {
        result[category] = []
      }
      result[category].push(action)
      return result
    }, {})
  }, [availableActions])

  const handleNewButtonChange = (event) => {
    const { name, value } = event.target
    setNewButton((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCreateButton = async () => {
    if (!newButton.action) {
      showErrorToast('アクションを選択してください')
      return
    }

    try {
      const success = await Promise.resolve(
        addCustomButton(
          newButton.action,
          newButton.text.trim(),
          newButton.color
        )
      )

      if (!success) {
        throw new Error('カスタムボタンの作成に失敗しました')
      }

      setNewButton(DEFAULT_BUTTON)
      showSuccessToast('カスタムボタンを作成しました')
    } catch (error) {
      console.error('[CustomTab] 作成エラー:', error)
      showErrorToast(error?.message || 'カスタムボタンの作成に失敗しました')
    }
  }

  const handleButtonUpdate = async (buttonId, field, value) => {
    try {
      const success = await Promise.resolve(
        updateCustomButtonById(buttonId, { [field]: value })
      )

      if (!success) {
        throw new Error('カスタムボタンの更新に失敗しました')
      }
    } catch (error) {
      console.error('[CustomTab] 更新エラー:', error)
      showErrorToast(error?.message || 'カスタムボタンの更新に失敗しました')
    }
  }

  const handleButtonDelete = async (buttonId) => {
    if (!window.confirm('このカスタムボタンを削除しますか？')) {
      return
    }

    try {
      const success = await Promise.resolve(removeCustomButtonById(buttonId))

      if (!success) {
        throw new Error('カスタムボタンの削除に失敗しました')
      }

      showSuccessToast('カスタムボタンを削除しました')
    } catch (error) {
      console.error('[CustomTab] 削除エラー:', error)
      showErrorToast(error?.message || 'カスタムボタンの削除に失敗しました')
    }
  }

  const handleSave = async () => {
    if (isSaving || isReloading) {
      return
    }

    setIsSaving(true)

    try {
      // saveCustomButtons は boolean を返す
      const success = await saveCustomButtons()

      if (!success) {
        throw new Error('カスタムボタンの保存に失敗しました')
      }

      showSuccessToast('カスタムボタンを保存しました')
    } catch (error) {
      console.error('[CustomTab] 保存エラー:', error)
      showErrorToast(error?.message || 'カスタムボタンの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReload = async () => {
    if (isSaving || isReloading) {
      return
    }

    setIsReloading(true)

    try {
      await loadCustomButtons()
      showSuccessToast('カスタムボタンを再読み込みしました')
    } catch (error) {
      console.error('[CustomTab] 再読み込みエラー:', error)
      showErrorToast(error?.message || 'カスタムボタンの再読み込みに失敗しました')
    } finally {
      setIsReloading(false)
    }
  }

  const isProcessing = isSaving || isReloading

  return (
    <div>
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg text-gray-700">
        カスタムボタン 【 機能が未完成 の為 開発モードのみ表示  】
      </h3>

      <p className="mb-4 text-gray-600">
        カスタムボタンは自由に追加・編集・削除できます。
        <br />
        加算比較ボタンもここで管理されます。
      </p>

      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-700">
          新しいカスタムボタンを作成
        </h4>

        <div className="mb-4 flex items-end gap-2.5">
          <div className="flex-1">
            <label
              htmlFor="new-button-action"
              className="mb-1.5 block font-bold text-gray-700"
            >
              アクション:
            </label>

            <select
              id="new-button-action"
              name="action"
              value={newButton.action}
              onChange={handleNewButtonChange}
              className="w-full rounded border border-gray-300 px-2 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">
                アクションを選択してください
              </option>

              {Object.entries(actionsByCategory).map(([category, actions]) => (
                <optgroup key={category} label={category}>
                  {actions.map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.icon || ''} {action.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="new-button-text"
              className="mb-1.5 block font-bold text-gray-700"
            >
              テキスト:
            </label>

            <input
              type="text"
              id="new-button-text"
              name="text"
              value={newButton.text}
              onChange={handleNewButtonChange}
              placeholder="ボタンのテキスト"
              className="w-full rounded border border-gray-300 px-2 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="w-20">
            <label
              htmlFor="new-button-color"
              className="mb-1.5 block font-bold text-gray-700"
            >
              カラー:
            </label>

            <input
              type="color"
              id="new-button-color"
              name="color"
              value={newButton.color}
              onChange={handleNewButtonChange}
              className="h-10 w-full cursor-pointer rounded border border-gray-300"
            />
          </div>

          <button
            type="button"
            id="create-custom-button"
            onClick={handleCreateButton}
            className="h-10 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-5 font-medium text-white hover:opacity-90 transition-opacity"
          >
            作成
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 font-semibold text-gray-700">
          既存のカスタムボタン
        </h4>

        {sortedButtons.length === 0 ? (
          <p className="py-4 text-center text-gray-500">
            カスタムボタンがありません
          </p>
        ) : (
          sortedButtons.map((button) => (
            <div
              key={button.id}
              className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <label className="mb-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={button.enabled === true}
                  onChange={(event) => {
                    handleButtonUpdate(
                      button.id,
                      'enabled',
                      event.target.checked
                    )
                  }}
                  className="h-5 w-5 accent-blue-600"
                />

                <span className="font-medium text-gray-700">
                  有効
                </span>
              </label>

              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    アクション:
                  </label>

                  <select
                    value={button.action ?? ''}
                    onChange={(event) => {
                      handleButtonUpdate(
                        button.id,
                        'action',
                        event.target.value
                      )
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
                  >
                    {availableActions.map((action) => (
                      <option key={action.id} value={action.id}>
                        {action.icon || ''} {action.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    テキスト:
                  </label>

                  <input
                    type="text"
                    value={button.text ?? ''}
                    onChange={(event) => {
                      handleButtonUpdate(
                        button.id,
                        'text',
                        event.target.value
                      )
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700">
                    カラー:
                  </label>

                  <input
                    type="color"
                    value={button.color || '#007bff'}
                    onChange={(event) => {
                      handleButtonUpdate(
                        button.id,
                        'color',
                        event.target.value
                      )
                    }}
                    className="h-10 w-full cursor-pointer rounded border border-gray-300"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleButtonDelete(button.id)
                }}
                className="rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mb-6 flex gap-2.5">
        <button
          type="button"
          onClick={handleReload}
          disabled={isProcessing}
          className="rounded-md bg-gray-600 px-5 py-2.5 text-white disabled:opacity-60 hover:bg-gray-700 transition-colors"
        >
          {isReloading ? '再読み込み中...' : 'カスタムボタンを再読み込み'}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isProcessing}
          className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {isSaving ? '保存中...' : 'カスタムボタンを保存'}
        </button>
      </div>
    </div>
  )
}

export default CustomTab