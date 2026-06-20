import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppState } from '@/contexts/appState'
import { useChildrenList } from '@/hooks/useChildrenList.js'
import { useTabs } from '@/hooks/useTabs/index.js'
import {
  clickEnterButton,
  clickAbsenceButton,
  clickExitButton,
} from '@/utils/attendance/index.js'
import { useToast } from '@/components/common/ToastContext.jsx'
import ProfessionalSupportCheckPanel from '@/components/common/ProfessionalSupportCheckPanel'
import AttendanceActionSection from './AttendanceActionSection.jsx'
import { isAttendanceDataLoaded } from '@/utils/attendance/helpers/attendanceStatus.js'
import './attendanceForm.css'

export default function ChildMemoPanel() {
  const dispatch = useDispatch()
  const {
    appState,
    attendanceData,
    setSelectedChildColumns,
    updateAppState,
    CURRENT_YMD,
    FACILITY_ID,
  } = useAppState()

  const { addProfessionalSupportNewTab } = useTabs()

  const {
    showSuccessToast,
    showErrorToast,
  } = useToast()

  const isStop = false
  const selectChild = appState.SELECT_CHILD

  const {
    childrenData,
    waitingChildrenData,
    experienceChildrenData,
  } = useChildrenList()

  const [selectedChildData, setSelectedChildData] = useState(null)
  const [attendanceItem, setAttendanceItem] = useState(null)
  const [isUIEnabled, setIsUIEnabled] = useState(false)
  const [loadingAction, setLoadingAction] = useState(null)

  useEffect(() => {
    if (!selectChild) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      setSelectedChildColumns({
        column5: null,
        column5Html: null,
        column6: null,
        column6Html: null,
      })
      return
    }

    const list = attendanceData?.data
    if (!Array.isArray(list)) {
      setAttendanceItem(null)
      setIsUIEnabled(false)
      return
    }

    const item = list.find(
      i => String(i.children_id) === String(selectChild)
    )

    setAttendanceItem(item || null)
    setIsUIEnabled(!!item)

    if (item) {
      setSelectedChildColumns({
        column5: item.column5 ?? null,
        column5Html: item.column5Html ?? null,
        column6: item.column6 ?? null,
        column6Html: item.column6Html ?? null,
      })
    }
  }, [selectChild, attendanceData, setSelectedChildColumns])

  useEffect(() => {
    if (!selectChild) {
      setSelectedChildData(null)
      return
    }

    const child =
      childrenData.find(c => String(c.children_id) === String(selectChild)) ||
      waitingChildrenData.find(c => String(c.children_id) === String(selectChild)) ||
      experienceChildrenData.find(c => String(c.children_id) === String(selectChild))

    setSelectedChildData(child || null)
  }, [selectChild, childrenData, waitingChildrenData, experienceChildrenData])

  if (!selectChild || !selectedChildData) {
    return (
      <div className="child-memo-panel flex-1 border-l bg-gray-50 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 text-center mt-8">
          Please select a child.
        </div>
      </div>
    )
  }

  const isAttendanceLoaded = isAttendanceDataLoaded(attendanceData)

  if (!isAttendanceLoaded) {
    return (
      <div className="child-memo-panel flex-1 min-h-0 border-l border-gray-300 bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-gray-800">
          今日の利用者データを取得してください
          </p>
        </div>
      </div>
    )
  }

  const hasChildAttendance = Boolean(attendanceItem)

  const column5 = attendanceItem?.column5 ?? null
  const column5Html = attendanceItem?.column5Html ?? null
  const column6 = attendanceItem?.column6 ?? null
  const column6Html = attendanceItem?.column6Html ?? null

  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || '')
  const isAbsent =
    typeof column5 === 'string' && column5.startsWith('欠席')

  const hasEntered = isTimeFormat(column5)
  const hasExited = isTimeFormat(column6)

  const facilityId = FACILITY_ID || appState?.FACILITY_ID || '1'
  const dateStr = CURRENT_YMD || appState?.CURRENT_YMD
  const childName = selectedChildData?.children_name || ''

  const runEnter = async () => {
    if (!column5Html) {
      showErrorToast('入室ボタン情報がありません')
      return
    }
    setLoadingAction('enter')
    try {
      const res = await clickEnterButton(column5Html, Number(selectChild), {
        children_name: childName,
        column5,
        column6,
        column6Html,
        facilityId,
        dateStr,
        dispatch,
        updateAppState,
      })
      if (res?.cancelled) return
      if (!res?.success) showErrorToast(res?.error || '入室に失敗しました')
    } catch (e) {
      console.error('Enter action error', e)
      showErrorToast(String(e?.message || e))
    } finally {
      setLoadingAction(null)
    }
  }

  const runLeave = async () => {
    if (!column6Html) {
      showErrorToast('退室ボタン情報がありません')
      return
    }
    setLoadingAction('leave')
    try {
      const res = await clickExitButton(column6Html, Number(selectChild), {
        enterTime: column5,
        children_name: childName,
        column5,
        column5Html,
        column6,
        facilityId,
        dateStr,
        dispatch,
        updateAppState,
      })
      if (res?.cancelled) return
      if (!res?.success) showErrorToast(res?.error || '退室に失敗しました')
    } catch (e) {
      console.error('Exit action error', e)
      showErrorToast(String(e?.message || e))
    } finally {
      setLoadingAction(null)
    }
  }

  const runAbsence = async () => {
    if (!column5Html) {
      showErrorToast('欠席ボタン情報がありません')
      return
    }
    setLoadingAction('absence')
    try {
      const res = await clickAbsenceButton(column5Html, Number(selectChild))
      if (res?.success) showSuccessToast('欠席モーダルを開きました')
      else showErrorToast(res?.error || '欠席モーダル表示に失敗しました')
    } catch (e) {
      console.error('Absence action error', e)
      showErrorToast(String(e?.message || e))
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="child-memo-panel flex-1 min-h-0 border-l border-gray-300 bg-gray-50 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        <div className="child-memo-attendance-form flex flex-col rounded bg-white border border-gray-300 gap-2 p-2">
          {hasChildAttendance ? (
            <AttendanceActionSection
              childId={selectChild}
              childName={childName}
              dateStr={dateStr}
              column5={column5}
              column5Html={column5Html}
              column6={column6}
              column6Html={column6Html}
              isAbsent={isAbsent}
              hasEntered={hasEntered}
              hasExited={hasExited}
              isUIEnabled={isUIEnabled}
              isStop={isStop}
              loadingAction={loadingAction}
              onEnter={runEnter}
              onLeave={runLeave}
              onAbsence={runAbsence}
              onProfessionalSupport={addProfessionalSupportNewTab}
            />
          ) : (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-sm font-medium text-amber-800">
                この児童の勤怠データが見つかりません
              </p>
              <p className="text-xs text-amber-700 mt-1">
                データを再取得するか、別の児童を選択してください
              </p>
            </div>
          )}
        </div>

        <ProfessionalSupportCheckPanel
          logTag="ChildMemoPanel"
          className="mt-2 w-full items-stretch px-0"
          buttonClassName="w-full text-xs"
          labelClassName="w-full"
        />
      </div>
    </div>
  )
}


