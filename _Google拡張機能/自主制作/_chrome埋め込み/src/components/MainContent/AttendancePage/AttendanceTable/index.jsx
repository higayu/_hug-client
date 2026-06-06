export default function AttendanceTable({
  attendanceRows,
  attendanceLoading,
  handlePostEnter,
}) {
  return (
    <div className={`table-wrap ${attendanceRows.length === 0 ? 'hidden' : ''}`}>
      <table className="data-table attendance-table">
        <thead>
          <tr>
            <th>児童</th>
            <th style={{ width: '5.5rem' }}>入室</th>
            <th style={{ width: '5.5rem' }}>退室</th>
            <th>状態</th>
            <th style={{ width: '6rem' }}>操作</th>
          </tr>
        </thead>

        <tbody>
          {attendanceRows.map((row) => (
            <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`}>
              <td>
                <div style={{ fontWeight: 600 }}>
                  {row.name || `ID ${row.c_id}`}
                </div>

                <div
                  style={{
                    color: 'var(--text-light)',
                    fontSize: '0.75rem',
                  }}
                >
                  c_id: {row.c_id || '-'}
                </div>
              </td>

              <td>{row.enterTime || '-'}</td>
              <td>{row.leaveTime || '-'}</td>

              <td>
                {row.isAbsenceStatus
                  ? row.absenceLabel
                  : row.enterOnclick
                    ? '入室登録可'
                    : row.enterTime
                      ? '入室済み'
                      : '-'}

                {row.isEnterMailEnabled ? ' / メール確認あり' : ''}
              </td>

              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.65rem' }}
                  onClick={() => handlePostEnter(row)}
                  disabled={!row.enterOnclick || attendanceLoading}
                >
                  入室
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}