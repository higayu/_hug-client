import { useEffect, useRef } from 'react'

/** moc/attendance/timer.js と同じ間隔（1分） */
export const ATTENDANCE_AUTO_UPDATE_INTERVAL_MS = 1 * 60 * 1000

const isSidePanelHost = () => Boolean(document.getElementById('hug-sidepanel-host'))

/**
 * 入退室一覧の定期自動更新（moc/attendance/timer.js 相当）
 * @param {(options?: { force?: boolean, silent?: boolean }) => Promise<void>} runAttendanceUpdate
 * @param {{ isPaused?: () => boolean }} [options]
 */
export function useAttendanceAutoUpdate(runAttendanceUpdate, options = {}) {
  const isRunningRef = useRef(false)
  const lastScheduledRunAtRef = useRef(0)
  const runRef = useRef(runAttendanceUpdate)
  const isPausedRef = useRef(options.isPaused)

  runRef.current = runAttendanceUpdate
  isPausedRef.current = options.isPaused

  useEffect(() => {
    const shouldRunScheduledUpdate = () => {
      if (typeof isPausedRef.current === 'function' && isPausedRef.current()) {
        return false
      }
      if (document.hidden && !isSidePanelHost()) {
        return false
      }
      return true
    }

    const runScheduled = async (scheduleOptions = {}) => {
      const force = Boolean(scheduleOptions?.force)

      if (!force && !shouldRunScheduledUpdate()) {
        console.log('[HUG WM] 自動更新スキップ（停止中または非表示タブ）')
        return
      }

      if (isRunningRef.current) {
        console.log('[HUG WM] 前回処理中のためスキップ')
        return
      }

      isRunningRef.current = true

      try {
        await runRef.current({ force, silent: !force })
      } catch (error) {
        console.error('[HUG WM] 入退室データ更新エラー:', error)
      } finally {
        isRunningRef.current = false
        if (!force) {
          lastScheduledRunAtRef.current = Date.now()
        }
      }
    }

    console.log('[HUG WM] 入退室自動更新タイマー開始')

    if (shouldRunScheduledUpdate()) {
      runScheduled()
    }

    const intervalId = window.setInterval(() => {
      if (shouldRunScheduledUpdate()) {
        runScheduled()
      }
    }, ATTENDANCE_AUTO_UPDATE_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.hidden) return
      if (!shouldRunScheduledUpdate()) return

      const elapsed = Date.now() - lastScheduledRunAtRef.current
      if (lastScheduledRunAtRef.current === 0 || elapsed >= ATTENDANCE_AUTO_UPDATE_INTERVAL_MS) {
        runScheduled()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
}
