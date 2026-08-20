import { useState } from 'react'

import { useCustomButtons } from '@/provider/CustomButtonsContext'
import { useToast } from '@/provider/ToastProvider/ToastContext.jsx'

function CustomTab() {
  const [isSaving, setIsSaving] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const { customButtons = [], updateCustomButtonById, saveCustomButtons, loadCustomButtons } = useCustomButtons()
  const { showSuccessToast, showErrorToast } = useToast()

  const handleEnabledChange = (buttonId, enabled) => {
    if (!updateCustomButtonById(buttonId, { enabled })) {
      showErrorToast('表示設定の更新に失敗しました')
    }
  }

  const handleSave = async () => {
    if (isSaving || isReloading) return
    setIsSaving(true)
    try {
      if (!(await saveCustomButtons())) throw new Error('カスタムボタン設定の保存に失敗しました')
      showSuccessToast('カスタムボタン設定を保存しました')
    } catch (error) {
      console.error('[CustomTab] 保存エラー:', error)
      showErrorToast(error?.message || 'カスタムボタン設定の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReload = async () => {
    if (isSaving || isReloading) return
    setIsReloading(true)
    try {
      if (!(await loadCustomButtons())) throw new Error('カスタムボタン設定の再読み込みに失敗しました')
      showSuccessToast('カスタムボタン設定を再読み込みしました')
    } catch (error) {
      console.error('[CustomTab] 再読み込みエラー:', error)
      showErrorToast(error?.message || 'カスタムボタン設定の再読み込みに失敗しました')
    } finally {
      setIsReloading(false)
    }
  }

  const isProcessing = isSaving || isReloading

  return (
    <div>
      <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg text-gray-700">
        カスタムボタンの表示設定
      </h3>
      <p className="mb-4 text-gray-600">
        ヘッダーのカスタムボタンメニューに表示する機能を選択してください。
      </p>

      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
        {customButtons.map((button) => (
          <label key={button.id} className="flex cursor-pointer items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 last:border-b-0 hover:bg-gray-50">
            <span>
              <span className="block font-medium text-gray-700">
                {button.icon ? `${button.icon} ` : ''}{button.name}
              </span>
              {button.description && (
                <span className="mt-0.5 block text-sm text-gray-500">{button.description}</span>
              )}
            </span>
            <input
              type="checkbox"
              checked={button.enabled === true}
              onChange={(event) => handleEnabledChange(button.id, event.target.checked)}
              className="h-5 w-5 flex-shrink-0 accent-blue-600"
              aria-label={`${button.name}を表示`}
            />
          </label>
        ))}
      </div>

      <div className="mb-6 flex gap-2.5">
        <button type="button" onClick={handleReload} disabled={isProcessing} className="rounded-md bg-gray-600 px-5 py-2.5 text-white transition-colors hover:bg-gray-700 disabled:opacity-60">
          {isReloading ? '再読み込み中...' : '再読み込み'}
        </button>
        <button type="button" onClick={handleSave} disabled={isProcessing} className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-60">
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}

export default CustomTab
