const sectionTitleClassName = 'mb-1.5 text-[11px] font-bold text-[#555]'

const gridClassName = 'mb-2 grid grid-cols-2 items-end gap-2'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const buttonClassName =
  'cursor-pointer rounded border border-[#ccc] bg-white px-2.5 py-1.5 disabled:cursor-default disabled:opacity-60'

export default function AttendanceChildrenSection({
  attendanceDate,
  attendanceLoading,
  handleAttendanceFetch,
  setAttendanceDate,
}) {
  return (
    <section className="mb-2.5 rounded-md border border-[#90caf9] bg-[#e8f4fc] px-2.5 py-2">
      <div className={sectionTitleClassName}>出席表・児童一覧</div>

      <div className={gridClassName}>
        <label className={labelClassName}>
          出席表日付
          <input
            type="date"
            className={inputClassName}
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
          />
        </label>

        <button
          type="button"
          className={buttonClassName}
          onClick={handleAttendanceFetch}
          disabled={attendanceLoading}
        >
          児童を再取得
        </button>
      </div>
    </section>
  )
}