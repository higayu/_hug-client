import { RefreshCw } from 'lucide-react'

export default function AttendanceHeader({
  ATTENDANCE_FACILITY_OPTIONS,
  attendanceDate,
  attendanceFacilityMap,
  attendanceLoading,
  attendanceStatus,
  handleAttendanceFacilityToggle,
  handleAttendanceFetch,
  setAttendanceDate,
}) {
  return (
    <>
      <div
        className="flex justify-between items-center mb-4"
        style={{ marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}
      >
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
          HUG WM 入退室一覧
        </h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAttendanceFetch}
          disabled={attendanceLoading}
        >
          <RefreshCw size={16} />
          {attendanceLoading ? '取得中...' : '一覧を取得'}
        </button>
      </div>

      <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label className="label">出席表日付</label>
          <input
            type="date"
            className="input-field"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
          />
        </div>

        <div style={{ flex: 2 }}>
          <label className="label">施設フィルタ</label>

          <div className="attendance-filter-list">
            {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
              <label key={option.id} className="attendance-filter-item">
                <input
                  type="checkbox"
                  checked={Boolean(attendanceFacilityMap[String(option.id)])}
                  onChange={(event) =>
                    handleAttendanceFacilityToggle(
                      option.id,
                      event.target.checked,
                    )
                  }
                />
                <span>{option.value}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <p
        style={{
          color: 'var(--text-light)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
        }}
      >
        {attendanceStatus}
      </p>
    </>
  )
}

