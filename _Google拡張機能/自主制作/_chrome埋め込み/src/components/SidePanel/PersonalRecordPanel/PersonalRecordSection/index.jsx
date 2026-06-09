const sectionTitleClassName = 'mb-1.5 text-[11px] font-bold text-[#555]'

const gridClassName = 'mb-2 grid grid-cols-2 items-end gap-2'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const buttonClassName =
  'cursor-pointer rounded border border-[#ccc] bg-white px-2.5 py-1.5 disabled:cursor-default disabled:opacity-60'

const fetchButtonClassName =
  'cursor-pointer rounded border border-[#5e35b1] bg-[#ede7f6] px-2.5 py-1.5 font-bold text-[#4527a0] disabled:cursor-default disabled:opacity-60'

export default function PersonalRecordSection({
  handleHugFetch,
  handleHugMonthFetch,
  handleHugSave,
  hprCachedRecord,
  hprEndDate,
  hprLoading,
  hprNote,
  hprPublishSaveVisible,
  hprRecordStaff,
  hprResults,
  hprStartDate,
  hugStatus,
  setHprEndDate,
  setHprNote,
  setHprRecordStaff,
  setHprStartDate,
}) {
  const hasRecordStaffOptions = Boolean(
    hprCachedRecord?.recordStaff?.options?.length,
  )

  const canSave = Boolean(hprCachedRecord?.editHtml) && !hprLoading

  return (
    <section className="mb-2.5 rounded-md border border-[#ce93d8] bg-[#f6edf8] px-2.5 py-2">
      <div className={sectionTitleClassName}>個人記録</div>

      <div className={gridClassName}>
        <label className={labelClassName}>
          開始日
          <input
            type="date"
            className={inputClassName}
            value={hprStartDate}
            onChange={(event) => setHprStartDate(event.target.value)}
          />
        </label>

        <label className={labelClassName}>
          終了日
          <input
            type="date"
            className={inputClassName}
            value={hprEndDate}
            onChange={(event) => setHprEndDate(event.target.value)}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={`${buttonClassName} flex-1`}
          onClick={handleHugMonthFetch}
          disabled={hprLoading}
        >
          過去の自動検索
        </button>

        <button
          type="button"
          className={`${fetchButtonClassName} flex-1`}
          onClick={handleHugFetch}
          disabled={hprLoading}
        >
          {hprLoading ? '取得中...' : '個人記録を取得'}
        </button>
      </div>

      <div className="mt-2 text-xs text-[#666]">{hugStatus}</div>

      <label className={`${labelClassName} mt-2`}>
        記録者
        <select
          className={inputClassName}
          value={hprRecordStaff}
          onChange={(event) => setHprRecordStaff(event.target.value)}
          disabled={!hasRecordStaffOptions}
        >
          {hasRecordStaffOptions ? (
            hprCachedRecord.recordStaff.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))
          ) : (
            <option value="">取得後に表示されます</option>
          )}
        </select>
      </label>

      <textarea
        id="hug-form-note"
        className="mt-2 block min-h-40 w-full resize-y rounded border border-[#ccc] bg-white p-2 text-xs leading-[1.45]"
        rows="12"
        spellCheck="false"
        value={hprNote}
        onChange={(event) => setHprNote(event.target.value)}
        placeholder="取得後に表示されます。"
      />

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          className="flex-1 cursor-pointer rounded border border-[#2e7d32] bg-[#e8f5e9] px-2.5 py-1.5 font-bold text-[#1b5e20] disabled:cursor-default disabled:opacity-60"
          onClick={() => handleHugSave('1')}
          disabled={!canSave}
        >
          下書きで更新
        </button>

        {hprPublishSaveVisible && (
          <button
            type="button"
            className="flex-1 cursor-pointer rounded border border-[#1565c0] bg-[#e3f2fd] px-2.5 py-1.5 font-bold text-[#0d47a1] disabled:cursor-default disabled:opacity-60"
            onClick={() => handleHugSave('2')}
            disabled={!canSave}
          >
            公開で更新
          </button>
        )}
      </div>

      {hprResults.length > 0 && (
        <div className="mt-2 text-[11px] text-[#777]">
          {hprResults.map((row) => (
            <div key={`${row.date}-${row.editPath}`}>
              {row.date} / {row.childName} / {row.attendance}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}