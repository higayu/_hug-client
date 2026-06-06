import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const checkboxClassName = 'mb-0 ml-0 mr-1 mt-0 align-middle'

export default function AttendanceHeader({
  ATTENDANCE_FACILITY_OPTIONS,
  attendanceDate,
  attendanceFacilityMap,
  attendanceLoading,
  attendanceRows,
  attendanceStatus,
  displayAttendanceRows,
  halfTime,
  handleAttendanceFacilityToggle,
  handleAttendanceFetch,
  handleHalfTimeChange,
  handleShowLeftRecordsChange,
  hasEnterMail,
  overTwoHoursCount,
  setAttendanceDate,
  showLeftRecords,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedFacilityNames = useMemo(() => {
    return ATTENDANCE_FACILITY_OPTIONS.filter((option) =>
      Boolean(attendanceFacilityMap[String(option.id)]),
    ).map((option) => option.value)
  }, [ATTENDANCE_FACILITY_OPTIONS, attendanceFacilityMap])

  const selectedFacilityLabel =
    selectedFacilityNames.length > 0
      ? selectedFacilityNames.join('、')
      : '未選択'

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-2 bg-[#333] px-2.5 py-2 text-white">
        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-white"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="attendance-header-detail"
        >
          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}

          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold opacity-95">
              {displayAttendanceRows.length}件表示 / 全{attendanceRows.length}
              件 / 経過アラート {overTwoHoursCount}件
            </div>

            <div className="mt-0.5 text-[11px] text-[#ffe082]">
              {hasEnterMail
                ? 'メール確認ありの入室があります'
                : 'メール確認なし'}
            </div>
          </div>
        </button>

        {!isOpen && (
          <div className="px-2 py-1 rounded-xl bg-gray-50 mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#555]">
            <span className="text-sm font-bold text-[#333]">
              日付: {attendanceDate || '未指定'}
            </span>
            <span className="text-sm font-bold text-[#333]">
              施設: {selectedFacilityLabel}
            </span>
          </div>
        )}

        <button
          type="button"
          className="shrink-0 cursor-pointer whitespace-nowrap rounded border border-white bg-transparent px-2.5 py-1 text-xs text-white hover:not-disabled:bg-white/15 disabled:cursor-default disabled:opacity-60"
          onClick={handleAttendanceFetch}
          disabled={attendanceLoading}
        >
          {attendanceLoading ? '取得中...' : '更新'}
        </button>
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
              </div>

              <div className="grid grid-cols-1 gap-2 rounded border border-[#ddd] bg-white px-2 py-1.5 sm:grid-cols-[400px_150px] sm:items-end">
                <div className="min-w-0">
                  <div className="mb-0.5 text-xs text-[#444]">施設</div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded border border-[#eee] bg-[#fafafa] px-2 py-1.5">
                    {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className="inline-flex items-center whitespace-nowrap text-xs text-[#444]"
                      >
                        <input
                          type="checkbox"
                          className={checkboxClassName}
                          checked={Boolean(attendanceFacilityMap[String(option.id)])}
                          onChange={(event) =>
                            handleAttendanceFacilityToggle(
                              option.id,
                              event.target.checked,
                            )
                          }
                        />
                        {option.value}
                      </label>
                    ))}
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

            <div>{attendanceStatus}</div>
          </div>
        </div>
      </div>
    </>
  )
}

