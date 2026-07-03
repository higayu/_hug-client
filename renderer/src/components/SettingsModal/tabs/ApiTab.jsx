import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  selectStaffId,
  selectFacilityId,
  selectUseAI,
  selectAutoSynchronization,
  selectAutoSwitching,
} from '@/store/slices/appStateSlice'
import BrowserOpenButton from "@/components/common/BrowserOpenButton";


function ApiTab({
  onSaveApiSettings,
  onReloadApiSettings,
  onInitializeSelectBoxes,
}) {
  const [isSaving, setIsSaving] = useState(false)

  // Redux store の値
  const STAFF_ID = useSelector(selectStaffId)
  const FACILITY_ID = useSelector(selectFacilityId)
  const USE_AI = useSelector(selectUseAI)
  const AUTO_SYNCHRONIZATION = useSelector(selectAutoSynchronization)
  const AUTO_SWITCHING = useSelector(selectAutoSwitching)

  // チェックボックス用ローカル状態
  const [autoSynchronization, setAutoSynchronization] = useState(
    AUTO_SYNCHRONIZATION
  )
  const [autoSwitching, setAutoSwitching] = useState(AUTO_SWITCHING)

  // Redux の値が再読み込みなどで変化したら画面にも反映
  useEffect(() => {
    setAutoSynchronization(AUTO_SYNCHRONIZATION)
  }, [AUTO_SYNCHRONIZATION])

  useEffect(() => {
    setAutoSwitching(AUTO_SWITCHING)
  }, [AUTO_SWITCHING])

  // 画面の入力値を集める
  const collectSavePayload = () => {
    const baseURL = document.getElementById('api-base-url')?.value ?? ''
    const staffId = document.getElementById('api-staff-id')?.value ?? ''
    const facilityId = document.getElementById('api-facility-id')?.value ?? ''
    const databaseType =
      document.getElementById('api-database-type')?.value ?? ''
    const useAI = document.getElementById('api-ai-type')?.value ?? ''

    const autoSynchronization =
      document.getElementById('api-auto-synchronization')?.checked ?? true

    const autoSwitching =
      document.getElementById('api-auto-switching')?.checked ?? true

    return {
      apiSettings: {
        baseURL,
        staffId,
        facilityId,
        databaseType,
        useAI,
        autoSynchronization: String(autoSynchronization),
        autoSwitching: String(autoSwitching),
      },
      redux: {
        STAFF_ID,
        FACILITY_ID,
        USE_AI,
        AUTO_SYNCHRONIZATION: autoSynchronization,
        AUTO_SWITCHING: autoSwitching,
      },
      at: new Date().toISOString(),
    }
  }

  // 初期表示時に select/input を現在の iniState で初期化
  useEffect(() => {
    let cancelled = false

    const getSelectSnapshot = (id) => {
      const select = document.getElementById(id)

      if (!select) {
        return {
          id,
          exists: false,
          value: '',
          selectedText: '',
          optionCount: 0,
          options: [],
        }
      }

      const options = Array.from(select.options).map((option, index) => ({
        index,
        value: option.value,
        text: option.textContent,
        selected: option.selected,
        disabled: option.disabled,
      }))

      return {
        id,
        exists: true,
        value: select.value,
        selectedText: select.selectedOptions?.[0]?.textContent ?? '',
        optionCount: options.length,
        options,
      }
    }

    const logSelectSnapshot = (label, extra = {}) => {
      const staffSelect = getSelectSnapshot('api-staff-id')
      const facilitySelect = getSelectSnapshot('api-facility-id')
      const databaseTypeSelect = getSelectSnapshot('api-database-type')
      const aiTypeSelect = getSelectSnapshot('api-ai-type')

      console.groupCollapsed(`🧪 [ApiTab DOM CHECK] ${label}`)

      console.log('📌 extra:', extra)

      console.log('👤 staffSelect:', {
        value: staffSelect.value,
        selectedText: staffSelect.selectedText,
        optionCount: staffSelect.optionCount,
      })
      console.table(staffSelect.options)

      console.log('🏢 facilitySelect:', {
        value: facilitySelect.value,
        selectedText: facilitySelect.selectedText,
        optionCount: facilitySelect.optionCount,
      })
      console.table(facilitySelect.options)

      console.log('🗄 databaseTypeSelect:', {
        value: databaseTypeSelect.value,
        selectedText: databaseTypeSelect.selectedText,
        optionCount: databaseTypeSelect.optionCount,
      })
      console.table(databaseTypeSelect.options)

      console.log('🤖 aiTypeSelect:', {
        value: aiTypeSelect.value,
        selectedText: aiTypeSelect.selectedText,
        optionCount: aiTypeSelect.optionCount,
      })
      console.table(aiTypeSelect.options)

      console.groupEnd()
    }

    const initialize = async () => {
      console.groupCollapsed('🧩 [ApiTab] mounted / initialize start')

      console.log('🗂 [ApiTab] Redux store values', {
        STAFF_ID,
        FACILITY_ID,
        USE_AI,
        AUTO_SYNCHRONIZATION,
        AUTO_SWITCHING,
      })

      console.log('🧩 [ApiTab] props', {
        onSaveApiSettings,
        onReloadApiSettings,
        onInitializeSelectBoxes,
      })

      logSelectSnapshot('before onInitializeSelectBoxes', {
        redux: {
          STAFF_ID,
          FACILITY_ID,
          USE_AI,
          AUTO_SYNCHRONIZATION,
          AUTO_SWITCHING,
        },
      })

      if (!onInitializeSelectBoxes) {
        console.warn('⚠️ [ApiTab] onInitializeSelectBoxes がありません')
        console.groupEnd()
        return
      }

      try {
        const result = await onInitializeSelectBoxes()

        // DOMのoption追加が反映された後に確認する
        setTimeout(() => {
          if (cancelled) return

          console.log('✅ [ApiTab] onInitializeSelectBoxes result:', result)

          logSelectSnapshot('after onInitializeSelectBoxes', {
            result,
            redux: {
              STAFF_ID,
              FACILITY_ID,
              USE_AI,
              AUTO_SYNCHRONIZATION,
              AUTO_SWITCHING,
            },
          })

          console.groupEnd()
        }, 0)
      } catch (error) {
        console.error('❌ [ApiTab] onInitializeSelectBoxes error:', error)
        console.groupEnd()
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [
    onInitializeSelectBoxes,
    onSaveApiSettings,
    onReloadApiSettings,
    STAFF_ID,
    FACILITY_ID,
    USE_AI,
    AUTO_SYNCHRONIZATION,
    AUTO_SWITCHING,
  ])

  // Redux値の変化確認用ログ
  useEffect(() => {
    console.log('🗂 [ApiTab] Redux store values changed', {
      STAFF_ID,
      FACILITY_ID,
      USE_AI,
      AUTO_SYNCHRONIZATION,
      AUTO_SWITCHING,
    })
  }, [
    STAFF_ID,
    FACILITY_ID,
    USE_AI,
    AUTO_SYNCHRONIZATION,
    AUTO_SWITCHING,
  ])

  const handleAutoSynchronizationChange = (e) => {
    const checked = e.target.checked

    console.log('[ApiTab] autoSynchronization changed', checked)

    setAutoSynchronization(checked)
  }

  const handleAutoSwitchingChange = (e) => {
    const checked = e.target.checked

    console.log('[ApiTab] autoSwitching changed', checked)

    setAutoSwitching(checked)
  }

  // 再読み込みボタン
  const handleReload = async () => {
    console.log('[ApiTab] handleReload clicked')

    if (!onReloadApiSettings) {
      console.warn('[ApiTab] onReloadApiSettings is not defined')
      return
    }

    setIsSaving(true)
    console.log('[ApiTab] reload start')

    try {
      await onReloadApiSettings()
      console.log('[ApiTab] reload success')
    } catch (error) {
      console.error('[ApiTab] reload error', error)
    } finally {
      setIsSaving(false)
      console.log('[ApiTab] reload end')
    }
  }

  // 保存ボタン
  const handleSave = async () => {
    console.log('[ApiTab] handleSave clicked')

    if (!onSaveApiSettings) {
      console.warn('[ApiTab] onSaveApiSettings is not defined')
      return
    }

    const payload = collectSavePayload()
    console.log('📤 [ApiTab] save payload', payload)

    setIsSaving(true)
    console.log('[ApiTab] save start')

    try {
      const res = await onSaveApiSettings(payload)
      console.log('📥 [ApiTab] save response', res)
      console.log('[ApiTab] save success')
    } catch (error) {
      console.error('[ApiTab] save error', error)
    } finally {
      setIsSaving(false)
      console.log('[ApiTab] save end')
    }
  }

  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">
        API設定 (ini.json)
      </h3>

      <div className="mb-6">
        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-base-url"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            APIベースURL:
          </label>
          <input
            type="text"
            id="api-base-url"
            data-path="apiSettings.baseURL"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] api-base-url changed', e.target.value)
            }
          />
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-staff-id"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            スタッフ:
          </label>
          <select
            id="api-staff-id"
            data-path="apiSettings.staffId"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] staff changed', e.target.value)
            }
          >
            <option value="">選択してください</option>
          </select>
          <BrowserOpenButton
            switch_id={2}
            path={"/houday/build-file/yoshijima/staffs"}
            title= 'スタッフが見つからない場合はこちらから修正してください'
          />
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-facility-id"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            施設:
          </label>
          <select
            id="api-facility-id"
            data-path="apiSettings.facilityId"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] facility changed', e.target.value)
            }
          >
            <option value="">選択してください</option>
          </select>
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-database-type"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            データベースタイプ:
          </label>
          <select
            id="api-database-type"
            data-path="apiSettings.databaseType"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] databaseType changed', e.target.value)
            }
          >
            <option value="sqlite">SQLite</option>
            <option value="mariadb">MariaDB</option>
          </select>
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-ai-type"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            AI種別:
          </label>
          <select
            id="api-ai-type"
            data-path="apiSettings.useAI"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] AI type changed', e.target.value)
            }
          >
            <option value="gemini">gemini</option>
            <option value="chatGPT">chatGPT</option>
            <option value="ollama">ollama</option>
            <option value="deepseek">deepseek</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-auto-synchronization"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            自動同期:
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              id="api-auto-synchronization"
              data-path="apiSettings.autoSynchronization"
              checked={autoSynchronization}
              onChange={handleAutoSynchronizationChange}
              className="w-4 h-4"
            />
            <span>
              有効にする
            </span>
            <label>※閉じる前に同期処理を実行します</label>
          </label>
        </div>

        <div className="flex items-center mb-3 py-2">
          <label
            htmlFor="api-auto-switching"
            className="font-medium text-gray-700 min-w-[120px]"
          >
            自動切替:
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              id="api-auto-switching"
              data-path="apiSettings.autoSwitching"
              checked={autoSwitching}
              onChange={handleAutoSwitchingChange}
              className="w-4 h-4"
            />
            <span>
              有効にする
            </span>
            <label>※吉島サーバに接続できる場合に自動で切り替わります</label>
          </label>
        </div>
      </div>

      <div className="mb-6 flex gap-2.5">
        <button
          id="reload-api-settings"
          type="button"
          onClick={handleReload}
          disabled={isSaving}
          className="bg-gray-600 text-white px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {isSaving ? '再読み込み中...' : 'API設定を再読み込み'}
        </button>

        <button
          id="save-api-settings"
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {isSaving ? '保存中...' : 'API設定を保存'}
        </button>
      </div>
    </div>
  )
}

export default ApiTab