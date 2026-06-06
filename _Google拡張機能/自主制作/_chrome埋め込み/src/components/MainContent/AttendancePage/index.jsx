import AttendanceHeader from './AttendanceHeader'
import AttendanceTable from './AttendanceTable'

 export default function AttendancePage({
  ATTENDANCE_FACILITY_OPTIONS,
  attendanceDate,
  attendanceFacilityMap,
  attendanceLoading,
  attendanceRows,
  attendanceStatus,
  handleAttendanceFacilityToggle,
  handleAttendanceFetch,
  handlePostEnter,
  setAttendanceDate,
}) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <AttendanceHeader
        ATTENDANCE_FACILITY_OPTIONS={ATTENDANCE_FACILITY_OPTIONS}
        attendanceDate={attendanceDate}
        attendanceFacilityMap={attendanceFacilityMap}
        attendanceLoading={attendanceLoading}
        attendanceStatus={attendanceStatus}
        handleAttendanceFacilityToggle={handleAttendanceFacilityToggle}
        handleAttendanceFetch={handleAttendanceFetch}
        setAttendanceDate={setAttendanceDate}
      />

      <AttendanceTable
        attendanceRows={attendanceRows}
        attendanceLoading={attendanceLoading}
        handlePostEnter={handlePostEnter}
      />
    </div>
  )
}
