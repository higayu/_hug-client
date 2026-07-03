import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectFacilityId } from '@/store/slices/appStateSlice'
import { useToast } from '@/components/common/ToastContext.jsx'

const TITLE = '設定 > 設定編集 > API設定 から設定してください'

const FALLBACK_FACILITYS = [
  {
    id: 1,
    name: 'あゆむ',
    url: 'ayumu',
  },
  {
    id: 2,
    name: 'PD仁保',
    url: 'niho',
  },
  {
    id: 3,
    name: 'PD吉島',
    url: 'yoshijima',
  },
  {
    id: 4,
    name: 'はーとけあ',
    url: 'heartcare',
  },
  {
    id: 5,
    name: 'PD五日市',
    url: 'itukaiti',
  },
  {
    id: 6,
    name: 'PD光',
    url: 'hikari',
  },
  {
    id: 7,
    name: 'PD横川',
    url: 'yokogawa',
  },
  {
    id: 8,
    name: 'PD五日市駅前',
    url: 'itukaiti',
  },
]

function FacilitySelector() {
  const { showInfoToast } = useToast()

  const facilityId = useSelector(selectFacilityId)
  const databaseState = useSelector((state) => state.database)

  // onMouseDown と onContextMenu の二重発火防止
  const lastRightClickHandledAtRef = useRef(0)

  const facilitys = useMemo(() => {
    if (
      Array.isArray(databaseState?.facilitys) &&
      databaseState.facilitys.length > 0
    ) {
      return databaseState.facilitys
    }

    return FALLBACK_FACILITYS
  }, [databaseState?.facilitys])

  const currentFacility = useMemo(() => {
    const currentFacilityId = String(facilityId || '')

    if (!currentFacilityId) {
      return null
    }

    return (
      facilitys.find((facility) => String(facility.id) === currentFacilityId) ||
      null
    )
  }, [facilityId, facilitys])

  const facilityLabel = currentFacility?.name || '未設定'

  useEffect(() => {
    console.log('📦 [FacilitySelector] 施設データ:', facilitys)
    console.log('🏢 [FacilitySelector] 現在の施設:', {
      facilityId,
      facilityLabel,
      currentFacility,
    })
  }, [facilitys, facilityId, facilityLabel, currentFacility])

  const openConfigFolder = useCallback(async () => {
    try {
      if (!window.electronAPI?.openConfigFolder) {
        showInfoToast('❌ 設定フォルダーを開く機能が見つかりません')
        console.error(
          '❌ [FacilitySelector] window.electronAPI.openConfigFolder が存在しません'
        )
        return
      }

      const result = await window.electronAPI.openConfigFolder()

      if (result?.success) {
        showInfoToast('📁 設定フォルダーを開きました')
        console.log('✅ 設定フォルダーを開きました:', result.path)
      } else {
        showInfoToast(`❌ 設定フォルダーを開けませんでした: ${result?.error}`)
        console.error('❌ 設定フォルダーを開く失敗:', result?.error)
      }
    } catch (err) {
      showInfoToast('❌ 設定フォルダーを開く際にエラーが発生しました')
      console.error('❌ 設定フォルダーを開くエラー:', err)
    }
  }, [showInfoToast])

  const handleOpenConfigFolder = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()

      // onMouseDown と onContextMenu が連続で来た場合の二重実行防止
      if (now - lastRightClickHandledAtRef.current < 500) {
        return
      }

      lastRightClickHandledAtRef.current = now

      console.log('🖱️ [FacilitySelector] 右クリック検知 → 設定フォルダーを開く')
      await openConfigFolder()
    },
    [openConfigFolder]
  )

  const handleMouseDown = useCallback(
    (e) => {
      // 右クリックだけ拾う
      if (e.button !== 2) {
        return
      }

      handleOpenConfigFolder(e)
    },
    [handleOpenConfigFolder]
  )

  const handleFacilityLabelClick = () => {
    showInfoToast(TITLE)

    console.log('🏢 [FacilitySelector] 施設ラベルクリック:', {
      facilityId,
      facilityLabel,
      currentFacility,
      message: TITLE,
    })
  }

  return (
    <div
      className="flex items-center gap-1"
      title={TITLE}
      onContextMenu={handleOpenConfigFolder}
      onMouseDown={handleMouseDown}
    >
      {/* 右クリックは外側divで拾う */}
      <button
        type="button"
        className="flex-shrink-0 p-1.5 rounded transition-colors duration-200 text-white hover:bg-yellow-600"
        title="右クリック: 設定フォルダーを開く（Database設定がずれた時の救済措置）"
      >
        施設:
      </button>

      {/* 表示専用ラベル。disabled は使わない */}
      <button
        type="button"
        id="facilityLabel"
        data-facility-id={facilityId || ''}
        data-facility-url={currentFacility?.url || ''}
        title={TITLE}
        onClick={handleFacilityLabelClick}
        className="js_c_f_id inline-flex min-w-[96px] items-center rounded border border-[#ddd] bg-gray-100 px-2 py-1 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-200"
      >
        {facilityLabel}
      </button>
    </div>
  )
}

export default FacilitySelector