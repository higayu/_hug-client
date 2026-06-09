import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const checkboxClassName = 'mb-0 ml-0 mr-1 mt-0 align-middle'

const panelButtonClassName =
  'flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-xs font-bold text-[#333]'

export default function RequestSetting({
  ATTENDANCE_FACILITY_OPTIONS,
  attendanceAutoUpdateEnabled,
  attendanceDate,
  attendanceFacilitiesReady,
  hprFacilitiesLoading,
  attendanceFacilityMap,
  handleAttendanceAutoUpdateChange,
  handleAttendanceFacilityToggle,
  handleHalfTimeChange,
  handleShowLeftRecordsChange,
  halfTime,
  setAttendanceDate,
  showLeftRecords,
  statusLastFetchedText,
  statusText,
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="rounded border border-[#ddd] bg-white px-2 py-1.5">
      <button
        type="button"
        className={panelButtonClassName}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="attendance-request-setting-panel"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        取得・表示設定
      </button>

      <div
        id="attendance-request-setting-panel"
        className="overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease',
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1.5">
              <label className="block min-w-[92px] text-xs text-[#444]">
                ハーフタイム
                <input
                  type="time"
                  className={inputClassName}
                  value={halfTime}
                  step="60"
                  onChange={(event) => handleHalfTimeChange(event.target.value)}
                />
              </label>

              <label className="block min-w-[92px] text-xs text-[#444]">
                退室済み
                <select
                  className={inputClassName}
                  value={showLeftRecords}
                  onChange={(event) => handleShowLeftRecordsChange(event.target.value)}
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

            <div className="grid grid-cols-1 gap-2 rounded border border-[#eee] bg-[#fafafa] px-2 py-1.5 sm:grid-cols-[400px_150px] sm:items-end">
              <div className="min-w-0">
                <div className="mb-0.5 text-xs text-[#444]">施設</div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
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
                          checked={Boolean(attendanceFacilityMap[String(option.id)])}
                          disabled={!attendanceFacilitiesReady}
                          onChange={(event) =>
                            handleAttendanceFacilityToggle(option.id, event.target.checked)
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

            <div className="flex flex-row flex-wrap items-center gap-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span>最終取得: {statusLastFetchedText || '未取得'}</span>
              </div>
              <div>{statusText}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
