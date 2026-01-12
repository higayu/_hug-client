import { useSelector, useDispatch } from 'react-redux'
import { setFacilityId, selectFacilityId } from '@/store/slices/appStateSlice'
import { useToast } from '@/components/common/ToastContext.jsx'

function FacilitySelector() {
  const dispatch = useDispatch()
  const { showInfoToast } = useToast()
  const facilityId = useSelector(selectFacilityId)

  const handleFacilityChange = (e) => {
    const nextFacilityId = e.target.value

    console.log('[facility change]', {
      before: facilityId,
      after: nextFacilityId,
    })

    dispatch(setFacilityId(nextFacilityId))
  }

  const handleContextMenu = async (e) => {
    e.preventDefault()

    try {
      const result = await onOpenConfigFolder()
      if (result?.success) {
        showInfoToast('📁 設定フォルダーを開きました')
      } else if (result?.error) {
        showInfoToast(`❌ ${result.error}`)
      }
    } catch (err) {
      showInfoToast('❌ 設定フォルダーを開く際にエラーが発生しました')
      console.error(err)
    }
  }

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

  return (
    <div className=''>
      {/* 🌟 設定フォルダーを開くボタン（右クリック） */}
      <button
        onContextMenu={handleOpenConfigFolder}
        className="flex-shrink-0 p-1.5 rounded transition-colors duration-200 text-white hover:bg-yellow-600"
        title="右クリック: 設定フォルダーを開く（Database設定がずれた時の救済措置）"
      >
        施設:
      </button>

      <select
        id="facilitySelect"
        value={facilityId}
        onChange={handleFacilityChange}
        className="js_c_f_id bg-white text-black border border-[#ddd] px-2 rounded text-sm"
      >
        <option value="3">PD吉島</option>
        <option value="6">PD光</option>
        <option value="7">PD横川</option>
        <option value="8">PD五日市駅前</option>
      </select>
    </div>
  )
}

export default FacilitySelector
