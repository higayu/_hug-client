import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  selectStaffId,
  selectFacilityId,
  selectUseAI,
} from '@/store/slices/appStateSlice'

function ApiTab({ onSaveApiSettings, onReloadApiSettings, onInitializeSelectBoxes }) {
  const [isSaving, setIsSaving] = useState(false)

    // 🔽 Redux(store) の値
  const STAFF_ID = useSelector(selectStaffId)
  const FACILITY_ID = useSelector(selectFacilityId)
  const USE_AI = useSelector(selectUseAI)

  // 追加：画面の入力値を集める関数
  const collectSavePayload = () => {
    const baseUrl = document.getElementById('api-base-url')?.value ?? ''
    const staffId = document.getElementById('api-staff-id')?.value ?? ''
    const facilityId = document.getElementById('api-facility-id')?.value ?? ''
    const databaseType = document.getElementById('api-database-type')?.value ?? ''
    const useAI = document.getElementById('api-ai-type')?.value ?? ''

    return {
      apiSettings: {
        baseUrl,
        staffId,
        facilityId,
        databaseType,
        useAI,
      },
      redux: {
        STAFF_ID,
        FACILITY_ID,
        USE_AI,
      },
      at: new Date().toISOString(),
    }
  }

  useEffect(() => {
    console.log('🧩 [ApiTab] mounted')
    console.log('🗂 [ApiTab] Redux store values', {
      STAFF_ID,
      FACILITY_ID,
      USE_AI,
    })

    console.log('🧩 [ApiTab] props', {
      onSaveApiSettings,
      onReloadApiSettings,
      onInitializeSelectBoxes,
    })
  }, [])


  // 初期化ログ
  useEffect(() => {
    console.log('[ApiTab] mounted')
    console.log('[ApiTab] props', {
      onSaveApiSettings,
      onReloadApiSettings,
      onInitializeSelectBoxes,
    })
    // 初期表示時に select/input を現在の iniState で初期化
    if (onInitializeSelectBoxes) {
      onInitializeSelectBoxes()
    }
  }, [onInitializeSelectBoxes, onReloadApiSettings, onSaveApiSettings])

  // 再読み込みボタンのハンドラー
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

  // 保存ボタンのハンドラー
  const handleSave = async () => {
    console.log('[ApiTab] handleSave clicked')

    if (!onSaveApiSettings) {
      console.warn('[ApiTab] onSaveApiSettings is not defined')
      return
    }

    // ✅ 追加：送信データをログ出力
    const payload = collectSavePayload()
    console.log('📤 [ApiTab] save payload', payload)

    setIsSaving(true)
    console.log('[ApiTab] save start')

    try {
      // ✅ payload を渡しても、受け側が使わなければ無視されるので基本安全
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
          <label htmlFor="api-base-url" className="font-medium text-gray-700 min-w-[120px]">
            APIベースURL:
          </label>
          <input
            type="text"
            id="api-base-url"
            data-path="apiSettings."
            className="px-3 py-2 border border-gray-300 rounded-md text-sm transition-all flex-1 max-w-[200px]"
            onChange={(e) =>
              console.log('[ApiTab] api-base-url changed', e.target.value)
            }
          />
        </div>

        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-staff-id" className="font-medium text-gray-700 min-w-[120px]">
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
        </div>

        <div className="flex items-center mb-3 py-2">
          <label htmlFor="api-facility-id" className="font-medium text-gray-700 min-w-[120px]">
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
          <label htmlFor="api-database-type" className="font-medium text-gray-700 min-w-[120px]">
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
          <label htmlFor="api-ai-type" className="font-medium text-gray-700 min-w-[120px]">
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
          </select>
        </div>
      </div>

      <div className="mb-6 flex gap-2.5">
        <button
          id="reload-api-settings"
          onClick={handleReload}
          disabled={isSaving}
          className="bg-gray-600 text-white px-5 py-2.5 rounded-md"
        >
          {isSaving ? '再読み込み中...' : 'API設定を再読み込み'}
        </button>

        <button
          id="save-api-settings"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-md"
        >
          {isSaving ? '保存中...' : 'API設定を保存'}
        </button>
      </div>
    </div>
  )
}

export default ApiTab
