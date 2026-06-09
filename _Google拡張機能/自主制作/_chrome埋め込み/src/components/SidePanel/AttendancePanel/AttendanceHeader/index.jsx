import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAttendanceStatusLine } from '@/hooks/useAttendanceStatusLine'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const checkboxClassName = 'mb-0 ml-0 mr-1 mt-0 align-middle'

export default function AttendanceHeader({
  ATTENDANCE_FACILITY_OPTIONS,
  attendanceAutoUpdateEnabled,
  attendanceFacilitiesReady,
  canFetchAttendance,
  attendanceDate,
  hprFacilitiesLoading,
  attendanceFacilityMap,
  attendanceLastFetchedAt,
  attendanceLoading,
  attendanceRows,
  attendanceStatus,
  displayAttendanceRows,
  showLeftRecords,
  halfTime,
  handleAttendanceAutoUpdateChange,
  handleAttendanceFacilityToggle,
  handleAttendanceFetch,
  handleHalfTimeChange,
  handleShowLeftRecordsChange,
  hasEnterMail,
  overTwoHoursCount,
  setAttendanceDate,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    statusText,
    statusLastFetchedText,
    toolbarSummary,
    toolbarLastFetchedText,
  } = useAttendanceStatusLine({
    attendanceRows,
    showLeftRecords,
    attendanceLastFetchedAt,
    attendanceLoading,
    attendanceStatus,
  })

  const toolbarCountText =
    toolbarSummary ??
    `${displayAttendanceRows.length}件表示 / 全${attendanceRows.length}件 / 経過アラート ${overTwoHoursCount}件`

  const selectedFacilityNames = useMemo(() => {
    return ATTENDANCE_FACILITY_OPTIONS.filter((option) =>
      Boolean(attendanceFacilityMap[String(option.id)]),
    ).map((option) => option.value)
  }, [ATTENDANCE_FACILITY_OPTIONS, attendanceFacilityMap])

  const selectedFacilityLabel =
    selectedFacilityNames.length > 0
      ? selectedFacilityNames.join('、')
      : '未選択'

  const fetchBlockHint = hprFacilitiesLoading
    ? '施設を取得中...'
    : !canFetchAttendance
      ? '施設の取得完了後に一覧を取得できます'
      : ''

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 bg-[#333] px-2 py-1 text-white">
        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-white"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="attendance-header-detail"
        >
          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}

          <div className="min-w-0 flex-1">
            <div className="hug-attendance-count text-xs font-bold opacity-95">
              {toolbarCountText}
            </div>

            <div className="mt-0.5 text-[11px] text-[#ffe082]">
              {hasEnterMail
                ? 'メール確認ありの入室があります'
                : 'メール確認なし'}
            </div>
          </div>
        </button>

        <button
          type="button"
          className="hover:bg-gray-200 shrink-0 cursor-pointer whitespace-nowrap rounded border border-white bg-transparent px-4 py-2 text-xs text-white disabled:cursor-default disabled:opacity-60"
          onClick={handleAttendanceFetch}
          disabled={!canFetchAttendance || attendanceLoading}
          title={fetchBlockHint || (attendanceLoading ? '取得中...' : '一覧を更新')}
        >
          {attendanceLoading ? '取得中...' : '更新'}
        </button>
        {!isOpen && (
          <div className="px-2 py-1 rounded-xl bg-gray-50 mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#555]">
            <span className="rounded-full border border-gray-300 px-2 py-1 text-xs font-bold text-[#333]">
              最終更新: {toolbarLastFetchedText || '未取得'}
            </span>           
           
            <span className="text-xs font-bold text-[#333]">
              日付: {attendanceDate || '未指定'}
            </span>

            <span className="text-xs font-bold text-[#333]">
              施設: {selectedFacilityLabel}
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 px-2.5 pt-2 text-xs text-[#555]">
        <div
          id="attendance-header-detail"
          className="overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.2s ease',
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mb-1.5 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1.5">
                <label className="block min-w-[92px] text-xs text-[#444]">
                  ハーフタイム
                  <input
                    type="time"
                    className={inputClassName}
                    value={halfTime}
                    step="60"
                    onChange={(event) =>
                      handleHalfTimeChange(event.target.value)
                    }
                  />
                </label>

                <label className="block min-w-[92px] text-xs text-[#444]">
                  退室済み
                  <select
                    className={inputClassName}
                    value={showLeftRecords}
                    onChange={(event) =>
                      handleShowLeftRecordsChange(event.target.value)
                    }
                  >
                    <option value="1">表示</option>
                    <option value="0">非表示</option>
                  </select>
                </label>

                <label className="block min-w-[120px] text-xs text-[#444]">
                  定期自動更新
                  <select
                    className={inputClassName}
                    value={attendanceAutoUpdateEnabled}
                    onChange={(event) =>
                      handleAttendanceAutoUpdateChange(event.target.value)
                    }
                  >
                    <option value="1">オン（1分間隔）</option>
                    <option value="0">オフ</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded border border-[#ddd] bg-white px-2 py-1.5 sm:grid-cols-[400px_150px] sm:items-end">
                <div className="min-w-0">
                  <div className="mb-0.5 text-xs text-[#444]">施設</div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded border border-[#eee] bg-[#fafafa] px-2 py-1.5">
                    {hprFacilitiesLoading ? (
                      <span className="text-xs text-[#666]">施設を取得中...</span>
                    ) : (
                      ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className="inline-flex items-center whitespace-nowrap text-xs text-[#444]"
                        >
                          <input
                            type="checkbox"
                            className={checkboxClassName}
                            checked={Boolean(
                              attendanceFacilityMap[String(option.id)],
                            )}
                            disabled={!attendanceFacilitiesReady}
                            onChange={(event) =>
                              handleAttendanceFacilityToggle(
                                option.id,
                                event.target.checked,
                              )
                            }
                          />
                          {option.value}
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <label className={labelClassName}>
                  出席表日付
                  <input
                    type="date"
                    className={inputClassName}
                    value={attendanceDate}
                    onChange={(event) => setAttendanceDate(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-row items-center gap-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span>最終取得: {toolbarLastFetchedText || '未取得'}</span>
              </div>
              <div>
                {statusText}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}