import AttendanceHeader from './AttendanceHeader'
import AttendanceTable from './AttendanceTable'

const panelClassName =
  'h-full overflow-hidden p-0 data-[active=true]:flex data-[active=false]:hidden data-[active=true]:flex-col'

const formRootClassName =
  'static m-0 flex min-h-0 w-full flex-1 transform-none flex-col overflow-auto rounded-none border-0 bg-white text-[13px] text-[#222] shadow-none'

export default function AttendancePanel(props) {
  const {
    ATTENDANCE_FACILITY_OPTIONS,
    HUG_WM_BASE_URL,
    HUG_WM_CONTACT_BOOK_LIST_URL,
    HUG_TIME_RE,
    WEEKDAY_JA,
    attendanceDate,
    attendanceFacilityMap,
    attendanceLoading,
    attendanceRows,
    attendanceStatus,
    displayAttendanceRows,
    halfTime,
    handleAlertPrefChange,
    handleAttendanceFacilityToggle,
    handleAttendanceFetch,
    handleHalfTimeChange,
    handlePostEnter,
    handlePostLeave,
    handleShowLeftRecordsChange,
    setAttendanceDate,
    showLeftRecords,
    sidePanelTab,
  } = props

  const isActive = sidePanelTab === 'attendance'

  const overTwoHoursCount = displayAttendanceRows.filter(
    (row) => row.isOverTwoHours,
  ).length

  const hasEnterMail = attendanceRows.some((row) => row.isEnterMailEnabled)

  return (
    <section
      id="hug-tab-attendance"
      className={panelClassName}
      role="tabpanel"
      data-tab-panel="attendance"
      data-active={isActive}
      hidden={!isActive}
      aria-labelledby="hug-tab-button-attendance"
    >
      <div id="hug-attendance-panel" className={formRootClassName}>
        <AttendanceHeader
          ATTENDANCE_FACILITY_OPTIONS={ATTENDANCE_FACILITY_OPTIONS}
          attendanceDate={attendanceDate}
          attendanceFacilityMap={attendanceFacilityMap}
          attendanceLoading={attendanceLoading}
          attendanceRows={attendanceRows}
          attendanceStatus={attendanceStatus}
          displayAttendanceRows={displayAttendanceRows}
          halfTime={halfTime}
          handleAttendanceFacilityToggle={handleAttendanceFacilityToggle}
          handleAttendanceFetch={handleAttendanceFetch}
          handleHalfTimeChange={handleHalfTimeChange}
          handleShowLeftRecordsChange={handleShowLeftRecordsChange}
          hasEnterMail={hasEnterMail}
          overTwoHoursCount={overTwoHoursCount}
          setAttendanceDate={setAttendanceDate}
          showLeftRecords={showLeftRecords}
        />

        <AttendanceTable
          HUG_WM_BASE_URL={HUG_WM_BASE_URL}
          HUG_WM_CONTACT_BOOK_LIST_URL={HUG_WM_CONTACT_BOOK_LIST_URL}
          HUG_TIME_RE={HUG_TIME_RE}
          WEEKDAY_JA={WEEKDAY_JA}
          attendanceLoading={attendanceLoading}
          attendanceRows={attendanceRows}
          displayAttendanceRows={displayAttendanceRows}
          handleAlertPrefChange={handleAlertPrefChange}
          handlePostEnter={handlePostEnter}
          handlePostLeave={handlePostLeave}
        />
      </div>
    </section>
  )
}

