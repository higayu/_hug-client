import { useDispatch, useSelector, useStore } from 'react-redux'
import {
  setAttendanceAutoUpdateEnabled as setAttendanceAutoUpdateEnabledAction,
  setAttendanceDate as setAttendanceDateAction,
  setAttendanceFacilityMap as setAttendanceFacilityMapAction,
  setAttendanceFacilities as setAttendanceFacilitiesAction,
  setAttendanceFacilitiesLoading as setAttendanceFacilitiesLoadingAction,
  setAttendanceLoading as setAttendanceLoadingAction,
  setAttendanceRows as setAttendanceRowsAction,
  setAttendanceStatus as setAttendanceStatusAction,
  setAttendanceLastFetchedAt as setAttendanceLastFetchedAtAction,
  setHalfTime as setHalfTimeAction,
  setShowLeftRecords as setShowLeftRecordsAction,
} from '@/store/slices/attendanceSlice'
import {
  setChatEndDate as setChatEndDateAction,
  setChatInput as setChatInputAction,
  setChatMessages as setChatMessagesAction,
  setChatModel as setChatModelAction,
  setChatStarted as setChatStartedAction,
  setChatStartDate as setChatStartDateAction,
} from '@/store/slices/chatSlice'
import {
  setCorrectionAdditional as setCorrectionAdditionalAction,
  setCorrectionDate as setCorrectionDateAction,
  setCorrectionLoading as setCorrectionLoadingAction,
  setCorrectionModalOpen as setCorrectionModalOpenAction,
  setCorrectionMode as setCorrectionModeAction,
  setCorrectionOriginal as setCorrectionOriginalAction,
  setCorrectionText as setCorrectionTextAction,
} from '@/store/slices/correctionSlice'
import {
  setChildrenByFacility as setChildrenByFacilityAction,
  setFacilities as setFacilitiesAction,
  setSelectedChildId as setSelectedChildIdAction,
  setSelectedFacilityId as setSelectedFacilityIdAction,
} from '@/store/slices/facilitySlice'
import {
  setHugAutoLoginEnabled as setHugAutoLoginEnabledAction,
  setHugKeepSession as setHugKeepSessionAction,
  setHugLoginId as setHugLoginIdAction,
  setHugPassword as setHugPasswordAction,
} from '@/store/slices/hugAuthSlice'
import {
  setHprAttendanceChildren as setHprAttendanceChildrenAction,
  setHprAttendanceDate as setHprAttendanceDateAction,
  setHprAttendanceLoading as setHprAttendanceLoadingAction,
  setHprCachedRecord as setHprCachedRecordAction,
  setHprChildrenByFacility as setHprChildrenByFacilityAction,
  setHprFacilities as setHprFacilitiesAction,
  setHprFacilitiesLoading as setHprFacilitiesLoadingAction,
  setHprPublishSaveVisible as setHprPublishSaveVisibleAction,
  setHprEndDate as setHprEndDateAction,
  setHprLoading as setHprLoadingAction,
  setHprNote as setHprNoteAction,
  setHprRecordStaff as setHprRecordStaffAction,
  setHprResults as setHprResultsAction,
  setHprSelectedChildId as setHprSelectedChildIdAction,
  setHprSelectedFacilityId as setHprSelectedFacilityIdAction,
  setHprStartDate as setHprStartDateAction,
  setHugStatus as setHugStatusAction,
} from '@/store/slices/hugPersonalRecordSlice'
import {
  setPrEndDate as setPrEndDateAction,
  setPrResults as setPrResultsAction,
  setPrStartDate as setPrStartDateAction,
  setPrStatus as setPrStatusAction,
  setSelectedPr as setSelectedPrAction,
} from '@/store/slices/personalRecordSlice'
import {
  setActivePage as setActivePageAction,
  setSidebarOpen as setSidebarOpenAction,
  setSidePanelTab as setSidePanelTabAction,
} from '@/store/slices/uiSlice'

export const useAppState = () => {
  const dispatch = useDispatch()
  const reduxStore = useStore()
  const { activePage, sidebarOpen, sidePanelTab } = useSelector((state) => state.ui)
  const {
    chatStarted,
    chatInput,
    chatModel,
    chatStartDate,
    chatEndDate,
    chatMessages,
  } = useSelector((state) => state.chat)
  const {
    facilities,
    childrenByFacility,
    selectedFacilityId,
    selectedChildId,
  } = useSelector((state) => state.facility)
  const {
    correctionDate,
    correctionOriginal,
    correctionAdditional,
    correctionText,
    correctionModalOpen,
    correctionLoading,
    correctionMode,
  } = useSelector((state) => state.correction)
  const {
    attendanceDate,
    attendanceRows,
    attendanceLoading,
    attendanceStatus,
    attendanceLastFetchedAt,
    halfTime,
    showLeftRecords,
    attendanceFacilityMap,
    attendanceFacilities,
    attendanceFacilitiesLoading,
    attendanceAutoUpdateEnabled,
  } = useSelector((state) => state.attendance)
  const {
    prStartDate,
    prEndDate,
    prResults,
    prStatus,
    selectedPr,
  } = useSelector((state) => state.personalRecord)
  const {
    hprStartDate,
    hprEndDate,
    hprResults,
    hprLoading,
    hprNote,
    hprCachedRecord,
    hprRecordStaff,
    hugStatus,
    hprAttendanceDate,
    hprSelectedFacilityId,
    hprSelectedChildId,
    hprChildrenByFacility,
    hprAttendanceChildren,
    hprAttendanceLoading,
    hprFacilities,
    hprFacilitiesLoading,
    hprPublishSaveVisible,
  } = useSelector((state) => state.hugPersonalRecord)
  const {
    loginStatus: hugLoginStatus,
    autoLoginEnabled: hugAutoLoginEnabled,
    keepSession: hugKeepSession,
    loginId: hugLoginId,
    password: hugPassword,
    loginCheckLoading: hugLoginCheckLoading,
  } = useSelector((state) => state.hugAuth)

  const createStoreSetter = (actionCreator, selector) => (value) => {
    const current = selector(reduxStore.getState())
    dispatch(actionCreator(typeof value === 'function' ? value(current) : value))
  }

  const setSidebarOpen = createStoreSetter(setSidebarOpenAction, (state) => state.ui.sidebarOpen)
  const setSidePanelTab = createStoreSetter(setSidePanelTabAction, (state) => state.ui.sidePanelTab)
  const setChatStarted = createStoreSetter(setChatStartedAction, (state) => state.chat.chatStarted)
  const setChatInput = createStoreSetter(setChatInputAction, (state) => state.chat.chatInput)
  const setChatModel = createStoreSetter(setChatModelAction, (state) => state.chat.chatModel)
  const setChatStartDate = createStoreSetter(setChatStartDateAction, (state) => state.chat.chatStartDate)
  const setChatEndDate = createStoreSetter(setChatEndDateAction, (state) => state.chat.chatEndDate)
  const setChatMessages = createStoreSetter(setChatMessagesAction, (state) => state.chat.chatMessages)
  const setChildrenByFacility = createStoreSetter(setChildrenByFacilityAction, (state) => state.facility.childrenByFacility)
  const setSelectedFacilityId = createStoreSetter(setSelectedFacilityIdAction, (state) => state.facility.selectedFacilityId)
  const setSelectedChildId = createStoreSetter(setSelectedChildIdAction, (state) => state.facility.selectedChildId)
  const setCorrectionDate = createStoreSetter(setCorrectionDateAction, (state) => state.correction.correctionDate)
  const setCorrectionOriginal = createStoreSetter(setCorrectionOriginalAction, (state) => state.correction.correctionOriginal)
  const setCorrectionAdditional = createStoreSetter(setCorrectionAdditionalAction, (state) => state.correction.correctionAdditional)
  const setCorrectionText = createStoreSetter(setCorrectionTextAction, (state) => state.correction.correctionText)
  const setCorrectionModalOpen = createStoreSetter(setCorrectionModalOpenAction, (state) => state.correction.correctionModalOpen)
  const setCorrectionLoading = createStoreSetter(setCorrectionLoadingAction, (state) => state.correction.correctionLoading)
  const setCorrectionMode = createStoreSetter(setCorrectionModeAction, (state) => state.correction.correctionMode)
  const setAttendanceDate = createStoreSetter(setAttendanceDateAction, (state) => state.attendance.attendanceDate)
  const setAttendanceRows = createStoreSetter(setAttendanceRowsAction, (state) => state.attendance.attendanceRows)
  const setAttendanceLoading = createStoreSetter(setAttendanceLoadingAction, (state) => state.attendance.attendanceLoading)
  const setAttendanceStatus = createStoreSetter(setAttendanceStatusAction, (state) => state.attendance.attendanceStatus)
  const setAttendanceLastFetchedAt = createStoreSetter(
    setAttendanceLastFetchedAtAction,
    (state) => state.attendance.attendanceLastFetchedAt,
  )
  const setHalfTime = createStoreSetter(setHalfTimeAction, (state) => state.attendance.halfTime)
  const setShowLeftRecords = createStoreSetter(setShowLeftRecordsAction, (state) => state.attendance.showLeftRecords)
  const setAttendanceFacilityMap = createStoreSetter(setAttendanceFacilityMapAction, (state) => state.attendance.attendanceFacilityMap)
  const setAttendanceFacilities = createStoreSetter(
    setAttendanceFacilitiesAction,
    (state) => state.attendance.attendanceFacilities,
  )
  const setAttendanceFacilitiesLoading = createStoreSetter(
    setAttendanceFacilitiesLoadingAction,
    (state) => state.attendance.attendanceFacilitiesLoading,
  )
  const setAttendanceAutoUpdateEnabled = createStoreSetter(
    setAttendanceAutoUpdateEnabledAction,
    (state) => state.attendance.attendanceAutoUpdateEnabled,
  )
  const setPrStartDate = createStoreSetter(setPrStartDateAction, (state) => state.personalRecord.prStartDate)
  const setPrEndDate = createStoreSetter(setPrEndDateAction, (state) => state.personalRecord.prEndDate)
  const setPrResults = createStoreSetter(setPrResultsAction, (state) => state.personalRecord.prResults)
  const setPrStatus = createStoreSetter(setPrStatusAction, (state) => state.personalRecord.prStatus)
  const setSelectedPr = createStoreSetter(setSelectedPrAction, (state) => state.personalRecord.selectedPr)
  const setHprStartDate = createStoreSetter(setHprStartDateAction, (state) => state.hugPersonalRecord.hprStartDate)
  const setHprEndDate = createStoreSetter(setHprEndDateAction, (state) => state.hugPersonalRecord.hprEndDate)
  const setHprResults = createStoreSetter(setHprResultsAction, (state) => state.hugPersonalRecord.hprResults)
  const setHprLoading = createStoreSetter(setHprLoadingAction, (state) => state.hugPersonalRecord.hprLoading)
  const setHprNote = createStoreSetter(setHprNoteAction, (state) => state.hugPersonalRecord.hprNote)
  const setHprCachedRecord = createStoreSetter(setHprCachedRecordAction, (state) => state.hugPersonalRecord.hprCachedRecord)
  const setHprRecordStaff = createStoreSetter(setHprRecordStaffAction, (state) => state.hugPersonalRecord.hprRecordStaff)
  const setHugStatus = createStoreSetter(setHugStatusAction, (state) => state.hugPersonalRecord.hugStatus)
  const setHprAttendanceDate = createStoreSetter(setHprAttendanceDateAction, (state) => state.hugPersonalRecord.hprAttendanceDate)
  const setHprSelectedFacilityId = createStoreSetter(setHprSelectedFacilityIdAction, (state) => state.hugPersonalRecord.hprSelectedFacilityId)
  const setHprSelectedChildId = createStoreSetter(setHprSelectedChildIdAction, (state) => state.hugPersonalRecord.hprSelectedChildId)
  const setHprChildrenByFacility = createStoreSetter(setHprChildrenByFacilityAction, (state) => state.hugPersonalRecord.hprChildrenByFacility)
  const setHprAttendanceChildren = createStoreSetter(setHprAttendanceChildrenAction, (state) => state.hugPersonalRecord.hprAttendanceChildren)
  const setHprAttendanceLoading = createStoreSetter(setHprAttendanceLoadingAction, (state) => state.hugPersonalRecord.hprAttendanceLoading)
  const setHprFacilities = createStoreSetter(setHprFacilitiesAction, (state) => state.hugPersonalRecord.hprFacilities)
  const setHprFacilitiesLoading = createStoreSetter(setHprFacilitiesLoadingAction, (state) => state.hugPersonalRecord.hprFacilitiesLoading)
  const setHprPublishSaveVisible = createStoreSetter(
    setHprPublishSaveVisibleAction,
    (state) => state.hugPersonalRecord.hprPublishSaveVisible,
  )

  const setHugLoginId = createStoreSetter(setHugLoginIdAction, (state) => state.hugAuth.loginId)
  const setHugPassword = createStoreSetter(setHugPasswordAction, (state) => state.hugAuth.password)
  const setHugAutoLoginEnabled = createStoreSetter(
    setHugAutoLoginEnabledAction,
    (state) => state.hugAuth.autoLoginEnabled,
  )
  const setHugKeepSession = createStoreSetter(setHugKeepSessionAction, (state) => state.hugAuth.keepSession)

  return {
    dispatch,
    reduxStore,
    setActivePageAction,
    setChatStartedAction,
    setChildrenByFacilityAction,
    setFacilitiesAction,
    setSelectedChildIdAction,
    setSelectedFacilityIdAction,
    activePage,
    sidebarOpen,
    sidePanelTab,
    chatStarted,
    chatInput,
    chatModel,
    chatStartDate,
    chatEndDate,
    chatMessages,
    facilities,
    childrenByFacility,
    selectedFacilityId,
    selectedChildId,
    correctionDate,
    correctionOriginal,
    correctionAdditional,
    correctionText,
    correctionModalOpen,
    correctionLoading,
    correctionMode,
    attendanceDate,
    attendanceRows,
    attendanceLoading,
    attendanceStatus,
    attendanceLastFetchedAt,
    halfTime,
    showLeftRecords,
    attendanceFacilityMap,
    attendanceFacilities,
    attendanceFacilitiesLoading,
    attendanceAutoUpdateEnabled,
    prStartDate,
    prEndDate,
    prResults,
    prStatus,
    selectedPr,
    hprStartDate,
    hprEndDate,
    hprResults,
    hprLoading,
    hprNote,
    hprCachedRecord,
    hprRecordStaff,
    hugStatus,
    hprAttendanceDate,
    hprSelectedFacilityId,
    hprSelectedChildId,
    hprChildrenByFacility,
    hprAttendanceChildren,
    hprAttendanceLoading,
    hprFacilities,
    hprFacilitiesLoading,
    hprPublishSaveVisible,
    hugLoginStatus,
    hugAutoLoginEnabled,
    hugKeepSession,
    hugLoginId,
    hugLoginCheckLoading,
    hugPassword,
    setSidebarOpen,
    setSidePanelTab,
    setChatStarted,
    setChatInput,
    setChatModel,
    setChatStartDate,
    setChatEndDate,
    setChatMessages,
    setChildrenByFacility,
    setSelectedFacilityId,
    setSelectedChildId,
    setCorrectionDate,
    setCorrectionOriginal,
    setCorrectionAdditional,
    setCorrectionText,
    setCorrectionModalOpen,
    setCorrectionLoading,
    setCorrectionMode,
    setAttendanceDate,
    setAttendanceRows,
    setAttendanceLoading,
    setAttendanceStatus,
    setAttendanceLastFetchedAt,
    setHalfTime,
    setShowLeftRecords,
    setAttendanceFacilityMap,
    setAttendanceFacilities,
    setAttendanceFacilitiesLoading,
    setAttendanceAutoUpdateEnabled,
    setPrStartDate,
    setPrEndDate,
    setPrResults,
    setPrStatus,
    setSelectedPr,
    setHprStartDate,
    setHprEndDate,
    setHprResults,
    setHprLoading,
    setHprNote,
    setHprCachedRecord,
    setHprRecordStaff,
    setHugStatus,
    setHprAttendanceDate,
    setHprSelectedFacilityId,
    setHprSelectedChildId,
    setHprChildrenByFacility,
    setHprAttendanceChildren,
    setHprAttendanceLoading,
    setHprFacilities,
    setHprFacilitiesLoading,
    setHprPublishSaveVisible,
    setHugLoginId,
    setHugPassword,
    setHugAutoLoginEnabled,
    setHugKeepSession,
  }
}
