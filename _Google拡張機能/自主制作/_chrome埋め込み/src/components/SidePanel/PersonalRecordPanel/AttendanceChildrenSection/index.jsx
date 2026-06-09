import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  selectHprAttendanceChildren,
  selectHprAttendanceLoading,
} from '@/store/slices/hugPersonalRecordSlice'
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
  handleHprAttendanceDateChange,
  handleHprAttendanceFetch,
  handleHprFacilityChange,
  hprAttendanceDate,
  hprFacilities,
  hprFacilitiesLoading,
  hprSelectedChildId,
  hprSelectedFacilityId,
  setHprSelectedChildId,
}) {
  const hprAttendanceChildren = useSelector(selectHprAttendanceChildren)
  const hprAttendanceLoading = useSelector(selectHprAttendanceLoading)

  const childOptions = useMemo(
    () => (hprAttendanceChildren?.length ? hprAttendanceChildren : []),
    [hprAttendanceChildren],
  )

  const canFetchChildren =
    !hprFacilitiesLoading && Boolean(hprFacilities?.length) && Boolean(hprSelectedFacilityId)

  const isRefreshing = hprFacilitiesLoading || hprAttendanceLoading

  const childPlaceholder = hprFacilitiesLoading
    ? '施設を取得中...'
    : !hprFacilities?.length
      ? '施設を取得してから児童を取得してください'
      : '児童データはまだ取得されていません'

  return (
    <section className="mb-2.5 rounded-md border border-[#90caf9] bg-[#e8f4fc] px-2.5 py-2">
      <div className={sectionTitleClassName}>出席表・児童一覧</div>

    <div className="flex items-end gap-2">
      <label className={`${labelClassName} mb-2 block`}>
        出席表日付
        <input
          type="date"
          className={inputClassName}
          value={hprAttendanceDate}
          onChange={(event) => handleHprAttendanceDateChange(event.target.value)}
        />
      </label>

      <div className={gridClassName}>
        <label className={labelClassName}>
          事業所
          <select
            className={inputClassName}
            value={hprSelectedFacilityId ? String(hprSelectedFacilityId) : ''}
            onChange={(event) => handleHprFacilityChange(event.target.value)}
            disabled={hprFacilitiesLoading || !hprFacilities?.length}
          >
            {hprFacilitiesLoading ? (
              <option value="">施設を取得中...</option>
            ) : hprFacilities?.length ? (
              hprFacilities.map((facility) => (
                <option key={facility.facility_id} value={String(facility.facility_id)}>
                  {facility.name}
                </option>
              ))
            ) : (
              <option value="">HUG WM から施設を取得できません</option>
            )}
          </select>
        </label>
      </div>

      <div className="mb-2 flex items-end gap-2">
        <label className={`${labelClassName} min-w-0 flex-1`}>
          児童
          <select
            className={inputClassName}
            value={hprSelectedChildId ? String(hprSelectedChildId) : ''}
            onChange={(event) => setHprSelectedChildId(Number(event.target.value))}
            disabled={!canFetchChildren || !childOptions?.length}
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
              <option value="">{childPlaceholder}</option>
            )}
          </select>
        </label>

        <button
          type="button"
          className={`${buttonClassName} flex h-[30px] w-[34px] items-center justify-center`}
          onClick={handleHprAttendanceFetch}
          disabled={!canFetchChildren || isRefreshing}
          title={
            !canFetchChildren
              ? '施設の取得完了後に児童を取得できます'
              : isRefreshing
                ? '取得中...'
                : '事業所と児童を再取得'
          }
          aria-label={
            !canFetchChildren
              ? '施設の取得完了後に児童を取得できます'
              : isRefreshing
                ? '取得中...'
                : '事業所と児童を再取得'
          }
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    </section>
  )
}