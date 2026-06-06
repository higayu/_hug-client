import AttendanceChildrenSection from './AttendanceChildrenSection'
import PersonalRecordSection from './PersonalRecordSection'

const panelClassName =
  'h-full overflow-hidden p-0 data-[active=true]:flex data-[active=false]:hidden data-[active=true]:flex-col'

const formRootClassName =
  'static m-0 flex min-h-0 w-full flex-1 transform-none flex-col overflow-auto rounded-none border-0 bg-white px-3 pb-3.5 pt-2.5 text-sm leading-[1.4] text-[#222] shadow-none'

export default function PersonalRecordPanel(props) {
  const {
    attendanceDate,
    attendanceLoading,
    facilities,
    handleAttendanceFetch,
    handleFacilityChange,
    handleHugFetch,
    handleHugMonthFetch,
    handleHugSave,
    hprCachedRecord,
    hprEndDate,
    hprLoading,
    hprNote,
    hprRecordStaff,
    hprResults,
    hprStartDate,
    hugStatus,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    setAttendanceDate,
    setHprEndDate,
    setHprNote,
    setHprRecordStaff,
    setHprStartDate,
    setSelectedChildId,
    sidePanelTab,
  } = props

  const isActive = sidePanelTab === 'personal-record'

  return (
    <section
      id="hug-tab-personal-record"
      className={panelClassName}
      role="tabpanel"
      data-tab-panel="personal-record"
      data-active={isActive}
      hidden={!isActive}
      aria-labelledby="hug-tab-button-personal-record"
    >
      <div id="hug-personal-record-form" className={formRootClassName}>
        <AttendanceChildrenSection
          attendanceDate={attendanceDate}
          attendanceLoading={attendanceLoading}
          handleAttendanceFetch={handleAttendanceFetch}
          setAttendanceDate={setAttendanceDate}
        />

        <PersonalRecordSection
          facilities={facilities}
          handleFacilityChange={handleFacilityChange}
          handleHugFetch={handleHugFetch}
          handleHugMonthFetch={handleHugMonthFetch}
          handleHugSave={handleHugSave}
          hprCachedRecord={hprCachedRecord}
          hprEndDate={hprEndDate}
          hprLoading={hprLoading}
          hprNote={hprNote}
          hprRecordStaff={hprRecordStaff}
          hprResults={hprResults}
          hprStartDate={hprStartDate}
          hugStatus={hugStatus}
          selectedChildId={selectedChildId}
          selectedChildren={selectedChildren}
          selectedFacilityId={selectedFacilityId}
          setHprEndDate={setHprEndDate}
          setHprNote={setHprNote}
          setHprRecordStaff={setHprRecordStaff}
          setHprStartDate={setHprStartDate}
          setSelectedChildId={setSelectedChildId}
        />
      </div>
    </section>
  )
}