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
        statusLastFetchedText: null,
        toolbarSummary: null,
        toolbarLastFetchedText: null,
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
      statusLastFetchedText: null,
      toolbarSummary: null,
      toolbarLastFetchedText: null,
    }
  }, [
    attendanceRows,
    showLeftRecords,
    attendanceLastFetchedAt,
    attendanceLoading,
    attendanceStatus,
  ])
}