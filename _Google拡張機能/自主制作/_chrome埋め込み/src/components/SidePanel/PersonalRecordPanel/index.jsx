import AttendanceChildrenSection from './AttendanceChildrenSection'
import PersonalRecordSection from './PersonalRecordSection'

const panelClassName =
  'h-full overflow-hidden p-0 data-[active=true]:flex data-[active=false]:hidden data-[active=true]:flex-col'

const formRootClassName =
  'static m-0 flex min-h-0 w-full flex-1 transform-none flex-col overflow-auto rounded-none border-0 bg-white px-3 pb-3.5 pt-2.5 text-sm leading-[1.4] text-[#222] shadow-none'

export default function PersonalRecordPanel(props) {
  const {
    handleHprAttendanceDateChange,
    handleHprAttendanceFetch,
    handleHprFacilityChange,
    handleHprPanelHugFetch,
    handleHprPanelHugMonthFetch,
    handleHugSave,
    hprAttendanceDate,
    hprFacilities,
    hprFacilitiesLoading,
    hprCachedRecord,
    hprEndDate,
    hprLoading,
    hprNote,
    hprPublishSaveVisible,
    hprRecordStaff,
    hprResults,
    hprSelectedChildId,
    hprSelectedFacilityId,
    hprStartDate,
    hugStatus,
    setHprEndDate,
    setHprNote,
    setHprRecordStaff,
    setHprSelectedChildId,
    setHprStartDate,
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
          handleHprAttendanceDateChange={handleHprAttendanceDateChange}
          handleHprAttendanceFetch={handleHprAttendanceFetch}
          handleHprFacilityChange={handleHprFacilityChange}
          hprAttendanceDate={hprAttendanceDate}
          hprFacilities={hprFacilities}
          hprFacilitiesLoading={hprFacilitiesLoading}
          hprSelectedChildId={hprSelectedChildId}
          hprSelectedFacilityId={hprSelectedFacilityId}
          setHprSelectedChildId={setHprSelectedChildId}
        />

        <PersonalRecordSection
          handleHugFetch={handleHprPanelHugFetch}
          handleHugMonthFetch={handleHprPanelHugMonthFetch}
          handleHugSave={handleHugSave}
          hprCachedRecord={hprCachedRecord}
          hprEndDate={hprEndDate}
          hprLoading={hprLoading}
          hprNote={hprNote}
          hprPublishSaveVisible={hprPublishSaveVisible}
          hprRecordStaff={hprRecordStaff}
          hprResults={hprResults}
          hprStartDate={hprStartDate}
          hugStatus={hugStatus}
          setHprEndDate={setHprEndDate}
          setHprNote={setHprNote}
          setHprRecordStaff={setHprRecordStaff}
          setHprStartDate={setHprStartDate}
        />
      </div>
    </section>
  )
}