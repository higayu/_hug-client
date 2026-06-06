import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'

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
  const [isOpen, setIsOpen] = useState(false)

  const selectedFacilityCount = useMemo(() => {
    return ATTENDANCE_FACILITY_OPTIONS.filter((option) =>
      Boolean(attendanceFacilityMap[String(option.id)]),
    ).length
  }, [ATTENDANCE_FACILITY_OPTIONS, attendanceFacilityMap])

  const totalFacilityCount = ATTENDANCE_FACILITY_OPTIONS.length

  return (
    <div>
      <div
        className="flex justify-between items-center mb-4"
        style={{
          marginBottom: isOpen ? '1rem' : '0.75rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="attendance-header-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}

          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
            HUG WM 入退室一覧
          </h2>
        </button>

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

      {!isOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            color: 'var(--text-light)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <span>日付: {attendanceDate || '未指定'}</span>
          <span>
            施設: {selectedFacilityCount}/{totalFacilityCount}件選択
          </span>
        </div>
      )}

      <div
        id="attendance-header-panel"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
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
                      checked={Boolean(
                        attendanceFacilityMap[String(option.id)],
                      )}
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
        </div>
      </div>
    </div>
  )
}