import { useAttendanceFetch } from './useAttendanceFetch'
import AttendanceFetchButtons from './AttendanceFetchButtons'
import AttendanceFetchInfo from './AttendanceFetchInfo'

/**
 * 利用者データ取得 UI
 *
 * 役割を以下の2コンポーネントに分離する。
 * - AttendanceFetchButtons: Auto / 手動取得ボタン
 * - AttendanceFetchInfo: 取得時間 / フィルター
 *
 * 取得処理の hook はここで1回だけ呼び出し、
 * ボタン側へ必要な値とイベントだけ渡す。
 */
export default function GetTodayUsersChildren({ HideFlg = false }) {
  const { runFetch, autoFetchEnabled, toggleAutoFetch } = useAttendanceFetch(
    'GetTodayUsersChildren',
  )

  return (
    <div className="flex flex-row gap-1 py-1 px-2 items-center justify-center">
      <AttendanceFetchButtons
        autoFetchEnabled={autoFetchEnabled}
        onToggleAutoFetch={toggleAutoFetch}
        onFetch={() => runFetch()}
      />

      {!HideFlg && <AttendanceFetchInfo />}
    </div>
  )
}
