import { useMemo } from 'react'
import { formatAttendanceFetchStatus } from '@/services/hugService'

/**
 * moc の .hug-attendance-status / .hug-attendance-count 表示用
 */
export function useAttendanceStatusLine({
  attendanceRows,
  showLeftRecords,
  attendanceLastFetchedAt,
  attendanceLoading,
  attendanceStatus,
}) {
  return useMemo(() => {
    if (attendanceLoading) {
      return {
        statusText: attendanceStatus,
        toolbarSummary: null,
      }
    }

    if (attendanceLastFetchedAt != null) {
      return formatAttendanceFetchStatus(
        attendanceRows,
        showLeftRecords,
        attendanceLastFetchedAt,
      )
    }

    return {
      statusText: attendanceStatus,
      toolbarSummary: null,
    }
  }, [
    attendanceRows,
    showLeftRecords,
    attendanceLastFetchedAt,
    attendanceLoading,
    attendanceStatus,
  ])
}
