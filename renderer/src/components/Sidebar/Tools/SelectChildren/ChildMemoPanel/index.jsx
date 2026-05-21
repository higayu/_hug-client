import { useEffect, useState } from 'react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
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
import PersonalRecordGetBtn from '@/components/Sidebar/Tools/SelectChildren/PersonalRecordGetBtn'

function ChildMemoPanel() {
  const {
    appState,
    attendanceData,
    setSelectedChildColumns,
  } = useAppState()

  const {
    addPersonalRecordTab,
    addProfessionalSupportNewTab,
    addWebManagerAction_OutWindow,
  } = useTabs()

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

  const column5 = attendanceItem?.column5 ?? null
  const column5Html = attendanceItem?.column5Html ?? null
  const column6 = attendanceItem?.column6 ?? null
  const column6Html = attendanceItem?.column6Html ?? null

  const isTimeFormat = (v) => /^\d{2}:\d{2}$/.test(v || '')
  const isAbsent =
    typeof column5 === 'string' && column5.startsWith('欠席')

  const hasEntered = isTimeFormat(column5)
  const hasExited = isTimeFormat(column6)
  const disabledBtnClass = 'grayscale opacity-50 cursor-not-allowed'

  const nyushituButton = async (value) => {
    const cid = selectChild

    if (!value) {
      showErrorToast('Enter action data was not found.')
      return
    }

    try {
      const res = await clickEnterButton(value, Number(cid))
      if (res?.success === true) {
        showSuccessToast('Enter action completed.')
      } else {
        showErrorToast('Enter action failed.')
      }
    } catch (e) {
      console.error('Enter action error', e)
      showErrorToast('Enter action error.')
    }
  }

  const taishituButton = async (value) => {
    const cid = selectChild

    if (!value) {
      showErrorToast('Exit action data was not found.')
      return
    }

    try {
      const res = await clickExitButton(value, Number(cid))
      if (res?.success === true) {
        showSuccessToast('Exit action completed.')
      } else {
        showErrorToast('Exit action failed.')
      }
    } catch (e) {
      console.error('Exit action error', e)
      showErrorToast('Exit action error.')
    }
  }

  const kessekiButton = async (value) => {
    const cid = selectChild

    if (!value) {
      showErrorToast('Absence action data was not found.')
      return
    }

    try {
      const res = await clickAbsenceButton(value, Number(cid))
      if (res?.success === true) {
        showSuccessToast('Absence action completed.')
      } else {
        showErrorToast('Absence action failed.')
      }
    } catch (e) {
      console.error('Absence action error', e)
      showErrorToast('Absence action error.')
    }
  }

  return (
    <div className="child-memo-panel flex-1 min-h-0 border-l border-gray-300 bg-gray-50 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        <div
          className={`flex flex-col rounded bg-gray-200 gap-2 p-2 ${
            !isUIEnabled ? 'opacity-60' : ''
          }`}
        >
          {isAbsent ? (
            <div className="text-xs font-bold text-red-600">
              {column5}
            </div>
          ) : hasEntered ? (
            <>
              <div>入室: {column5}</div>

              {hasExited && (
                <div>退室: {column6}</div>
              )}

              {!hasExited && (
                <button
                  className={`btn-green mt-2 ${
                    !isUIEnabled || isStop ? disabledBtnClass : ''
                  }`}
                  onClick={() => taishituButton(column6Html)}
                  disabled={!isUIEnabled || isStop}
                >
                  退室
                </button>
              )}

              {hasExited && (
                <button
                  className={`btn-purple mt-2 p-2 ${
                    !isUIEnabled ? disabledBtnClass : ''
                  }`}
                  onClick={addProfessionalSupportNewTab}
                  disabled={!isUIEnabled}
                >
                  専門的支援
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className={`btn-blue p-2 w-[80px] ${
                  !isUIEnabled || isStop ? disabledBtnClass : ''
                }`}
                onClick={() => nyushituButton(column5Html)}
                disabled={!isUIEnabled || isStop}
              >
                入室
              </button>

              <button
                className={`btn-red mt-2 p-2 w-[80px] ${
                  !isUIEnabled || isStop ? disabledBtnClass : ''
                }`}
                onClick={() => kessekiButton(column5Html)}
                disabled={!isUIEnabled || isStop}
              >
                欠席
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <PersonalRecordGetBtn />

          <button
            id="professional-support-new"
            onClick={addWebManagerAction_OutWindow}
            title="Open web page"
            aria-label="Open web page"
            className="
              flex items-center justify-center
              bg-blue-300 rounded
              text-black
              px-3 py-2
              cursor-pointer
              transition-all
              hover:bg-[#e3f2fd]
            "
          >
            <GlobeAltIcon className="h-5 w-5" />
          </button>

          <button
            id="kojin-kiroku"
            onClick={addPersonalRecordTab}
            className="
              flex items-center justify-center
              bg-[#4CAF50] text-white
              px-3 py-2
              rounded-lg font-bold
              cursor-pointer transition-all whitespace-nowrap
              hover:bg-[#66BB6A] hover:scale-105
              active:bg-[#43A047] active:scale-[0.97]
            "
          >
            個人記録
          </button>
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

export default ChildMemoPanel
