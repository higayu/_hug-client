import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  selectAttendanceChildren,
  selectAttendanceLoading,
} from '@/store/slices/attendanceSlice'
import { FiRefreshCw } from 'react-icons/fi'

const sectionTitleClassName = 'mb-1.5 text-[11px] font-bold text-[#555]'

const gridClassName = 'mb-2 grid grid-cols-2 items-end gap-2'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const buttonClassName =
  'cursor-pointer rounded border border-[#ccc] bg-white px-2.5 py-1.5 disabled:cursor-default disabled:opacity-60'

const getChildId = (child) => child.c_id ?? child.child_id ?? child.id ?? ''

export default function AttendanceChildrenSection({
  attendanceDate,
  facilities,
  handleAttendanceFetch,
  handleFacilityChange,
  selectedChildId,
  selectedChildren,
  selectedFacilityId,
  setAttendanceDate,
  setSelectedChildId,
}) {
  const attendanceChildren = useSelector(selectAttendanceChildren)
  const attendanceLoading = useSelector(selectAttendanceLoading)

  const childOptions = useMemo(
    () => (attendanceChildren?.length ? attendanceChildren : selectedChildren),
    [attendanceChildren, selectedChildren],
  )

  return (
    <section className="mb-2.5 rounded-md border border-[#90caf9] bg-[#e8f4fc] px-2.5 py-2">
      <div className={sectionTitleClassName}>出席表・児童一覧</div>

    <div className="flex items-end gap-2">
      <label className={`${labelClassName} mb-2 block`}>
        出席表日付
        <input
          type="date"
          className={inputClassName}
          value={attendanceDate}
          onChange={(event) => setAttendanceDate(event.target.value)}
        />
      </label>

      <div className={gridClassName}>
        <label className={labelClassName}>
          事業所
          <select
            className={inputClassName}
            value={selectedFacilityId}
            onChange={(event) => handleFacilityChange(event.target.value)}
          >
            {facilities.map((facility) => (
              <option key={facility.facility_id} value={facility.facility_id}>
                {facility.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-2 flex items-end gap-2">
        <label className={`${labelClassName} min-w-0 flex-1`}>
          児童
          <select
            className={inputClassName}
            value={selectedChildId ? String(selectedChildId) : ''}
            onChange={(event) => setSelectedChildId(Number(event.target.value))}
            disabled={!childOptions?.length}
          >
            {childOptions?.length ? (
              childOptions.map((child) => {
                const childId = getChildId(child)

                return (
                  <option key={childId} value={String(childId)}>
                    {child.name}
                  </option>
                )
              })
            ) : (
              <option value="">児童データはまだ取得されていません</option>
            )}
          </select>
        </label>

        <button
          type="button"
          className={`${buttonClassName} flex h-[30px] w-[34px] items-center justify-center`}
          onClick={handleAttendanceFetch}
          disabled={attendanceLoading}
          title={attendanceLoading ? '取得中...' : '児童を再取得'}
          aria-label={attendanceLoading ? '取得中...' : '児童を再取得'}
        >
          <FiRefreshCw
            className={`h-4 w-4 ${attendanceLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    </section>
  )
}