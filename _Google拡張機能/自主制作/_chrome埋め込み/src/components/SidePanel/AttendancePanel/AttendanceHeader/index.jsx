import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAttendanceStatusLine } from '@/hooks/useAttendanceStatusLine'
import AuthSetting from './AuthSetting'
import RequestSetting from './RequestSetting'

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
  handleHugAuthCredentialsClear,
  handleHugAuthCredentialsSave,
  handleHugAutoLoginExecute,
  handleShowLeftRecordsChange,
  hugAutoLoginEnabled,
  hugLoginCheckLoading,
  hugKeepSession,
  hugLoginId,
  hugLoginStatus,
  hugPassword,
  hasEnterMail,
  overTwoHoursCount,
  setHugAutoLoginEnabled,
  setHugKeepSession,
  setHugLoginId,
  setHugPassword,
  setAttendanceDate,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    statusText,
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
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl bg-gray-50 px-2 py-1 text-xs text-[#555]">
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
              <RequestSetting
                ATTENDANCE_FACILITY_OPTIONS={ATTENDANCE_FACILITY_OPTIONS}
                attendanceAutoUpdateEnabled={attendanceAutoUpdateEnabled}
                attendanceDate={attendanceDate}
                attendanceFacilitiesReady={attendanceFacilitiesReady}
                attendanceFacilityMap={attendanceFacilityMap}
                handleAttendanceAutoUpdateChange={handleAttendanceAutoUpdateChange}
                handleAttendanceFacilityToggle={handleAttendanceFacilityToggle}
                handleHalfTimeChange={handleHalfTimeChange}
                handleShowLeftRecordsChange={handleShowLeftRecordsChange}
                halfTime={halfTime}
                hprFacilitiesLoading={hprFacilitiesLoading}
                setAttendanceDate={setAttendanceDate}
                showLeftRecords={showLeftRecords}
                statusLastFetchedText={toolbarLastFetchedText}
                statusText={statusText}
              />

              <AuthSetting
                handleHugAuthCredentialsClear={handleHugAuthCredentialsClear}
                handleHugAuthCredentialsSave={handleHugAuthCredentialsSave}
                handleHugAutoLoginExecute={handleHugAutoLoginExecute}
                hugAutoLoginEnabled={hugAutoLoginEnabled}
                hugLoginCheckLoading={hugLoginCheckLoading}
                hugKeepSession={hugKeepSession}
                hugLoginId={hugLoginId}
                hugLoginStatus={hugLoginStatus}
                hugPassword={hugPassword}
                setHugAutoLoginEnabled={setHugAutoLoginEnabled}
                setHugKeepSession={setHugKeepSession}
                setHugLoginId={setHugLoginId}
                setHugPassword={setHugPassword}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
