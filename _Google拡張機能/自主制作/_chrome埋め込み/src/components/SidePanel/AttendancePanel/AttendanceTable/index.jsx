const tableClassName =
  'w-full border-separate border-spacing-0 bg-white text-xs'

const thClassName =
  'sticky top-0 z-10 border-b border-[#ddd] bg-[#f0f0f0] px-1.5 py-1 text-left align-middle text-[#333] shadow-[0_1px_0_#ddd]'

const tdClassName =
  'border-b border-[#ddd] bg-white px-1.5 py-1.5 text-left align-middle'

const rowActionClassName =
  'cursor-pointer rounded border border-[#1565c0] bg-[#e3f2fd] px-2 py-1 font-bold text-[#0d47a1] disabled:cursor-default disabled:border-[#ccc] disabled:bg-[#eee] disabled:text-[#999]'

const numberInputClassName =
  'm-0 w-16 box-border rounded border border-[#ccc] bg-white px-1 py-0.5 text-xs'

const tableSelectClassName =
  'm-0 w-16 box-border rounded border border-[#ccc] bg-white px-1 py-0.5 text-xs'

export default function AttendanceTable({
  HUG_WM_BASE_URL,
  HUG_WM_CONTACT_BOOK_LIST_URL,
  HUG_TIME_RE,
  WEEKDAY_JA,
  attendanceLoading,
  displayAttendanceRows,
  handleAlertPrefChange,
  handlePostEnter,
  handlePostLeave,
}) {
  const formatRowStatus = (row) => {
    if (row.isAbsenceStatus) return '欠席'
    if (row.isOverTwoHours) {
      return `${row.hugAlertPref?.alertAfterMinutes ?? 120}分超過`
    }
    return '通常'
  }

  const planInfoTitle = (row) => row.jsStableChangeCont01Text || undefined

  return (
    <div className="min-h-0 flex-1 overflow-auto px-2.5 pb-2.5 pt-0">
      {displayAttendanceRows.length === 0 ? (
        <div className="px-2 py-4 text-xs text-[#666]">
          HUG WM にログインしたうえで「更新」を押してください。
        </div>
      ) : (
        <table className={tableClassName}>
          <thead className="relative z-10">
            <tr>
              <th className={thClassName}>ID</th>
              <th className={thClassName}>氏名</th>
              <th
                className={thClassName}
                title="0=オフ、1=パネル強調、2=別ウィンドウ相当"
              >
                種別
              </th>
              <th
                className={thClassName}
                title="入室からこの分数経過でアラート"
              >
                経過(分)
              </th>
              <th className={thClassName}>曜日</th>
              <th className={thClassName}>午前/午後</th>
              <th className={thClassName}>入室</th>
              <th className={thClassName}>退室</th>
              <th className={thClassName}>状態</th>
              <th className={thClassName}>入退室POST</th>
              <th className={thClassName}>加算記録</th>
            </tr>
          </thead>

          <tbody>
            {displayAttendanceRows.map((row) => (
              <tr
                key={`${row.c_id}-${row.r_id}-${row.rowIndex}`}
                className={[
                  'even:[&>td]:bg-[#fafafa]',
                  row.isOverTwoHours && '[&>td]:!bg-[#fff0f0]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <td className={tdClassName}>{row.c_id || '-'}</td>

                <td className={tdClassName}>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-left text-[#0d47a1] underline"
                    title={planInfoTitle(row)}
                    onClick={() =>
                      window.open(
                        `${HUG_WM_CONTACT_BOOK_LIST_URL}?id=${encodeURIComponent(
                          row.c_id,
                        )}&hug_auto_personal=1`,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    {row.name || `ID ${row.c_id}`}
                  </button>
                </td>

                <td className={tdClassName}>
                  <input
                    type="number"
                    className={numberInputClassName}
                    min="0"
                    max="99"
                    value={row.hugAlertPref?.alertType ?? 1}
                    onChange={(event) =>
                      handleAlertPrefChange(
                        row,
                        'alertType',
                        event.target.value,
                      )
                    }
                  />
                </td>

                <td className={tdClassName}>
                  <input
                    type="number"
                    className={numberInputClassName}
                    min="0"
                    value={row.hugAlertPref?.alertAfterMinutes ?? 120}
                    onChange={(event) =>
                      handleAlertPrefChange(
                        row,
                        'alertAfterMinutes',
                        event.target.value,
                      )
                    }
                  />
                </td>

                <td className={tdClassName}>
                  {WEEKDAY_JA[row.hugWeekdayIndex] || '-'}
                </td>

                <td className={tdClassName}>
                  <select
                    className={tableSelectClassName}
                    value={row.hugAlertPref?.amPmFlag ?? 0}
                    onChange={(event) =>
                      handleAlertPrefChange(
                        row,
                        'amPmFlag',
                        event.target.value,
                      )
                    }
                  >
                    <option value="0">午前</option>
                    <option value="1">午後</option>
                  </select>
                </td>

                <td className={tdClassName}>{row.enterTime || '-'}</td>

                <td className={tdClassName}>{row.leaveTime || '-'}</td>

                <td className={tdClassName}>{formatRowStatus(row)}</td>

                <td className={tdClassName}>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      className={[
                        rowActionClassName,
                        row.isEnterMailEnabled && "before:content-['mail_']",
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={planInfoTitle(row)}
                      onClick={() => handlePostEnter(row)}
                      disabled={!row.enterOnclick || attendanceLoading}
                    >
                      入室
                    </button>

                    <button
                      type="button"
                      className={[
                        rowActionClassName,
                        row.isOverTwoHours &&
                          'border-[#c62828] bg-[#ffebee] text-[#b71c1c]',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={planInfoTitle(row)}
                      onClick={() => handlePostLeave(row)}
                      disabled={
                        !row.leaveOnclick ||
                        !HUG_TIME_RE.test(String(row.enterTime || '').trim()) ||
                        attendanceLoading
                      }
                    >
                      退室
                    </button>
                  </div>
                </td>

                <td className={tdClassName}>
                  <button
                    type="button"
                    className={`${rowActionClassName} border-[#999] bg-[#f5f5f5] text-[#333]`}
                    onClick={() =>
                      window.open(
                        `${HUG_WM_BASE_URL}record_proceedings.php?mode=edit&select_child=${encodeURIComponent(
                          row.c_id,
                        )}`,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                    disabled={!row.c_id}
                  >
                    移動
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}