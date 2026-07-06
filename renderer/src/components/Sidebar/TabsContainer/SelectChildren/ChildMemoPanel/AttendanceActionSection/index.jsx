import { useEffect } from "react"
import AttendancePostButton from "./AttendancePostButton"
import {
  canPostEnter,
  canPostLeave,
  hasEnterMail,
  hasLeaveMail,
  buildEnterButtonTitle,
  buildLeaveButtonTitle,
  isAfternoonEnterBlocked,
} from "@/utils/attendance/helpers/attendanceButtonHelpers.js"

/**
 * 拡張入退室フォーム相当の入室・退室・欠席 UI
 */
export default function AttendanceActionSection({
  childId,
  childName,
  dateStr,
  column5,
  column5Html,
  column6,
  column6Html,
  isAbsent,
  hasEntered,
  hasExited,
  isUIEnabled,
  isStop,
  loadingAction,
  onEnter,
  onLeave,
  onAbsence,
  onProfessionalSupport,
}) {
  const disabled = !isUIEnabled || isStop || Boolean(loadingAction)

  const afternoonBlocked =
    !hasEntered && isAfternoonEnterBlocked(column5Html, childId, dateStr)

  const showEnter = canPostEnter(column5Html)
  const showLeave = !hasExited && canPostLeave(column6Html, column5)

  useEffect(() => {
    console.group("[AttendanceActionSection] 入退室ボタン表示判定")
    console.log("childId:", childId)
    console.log("childName:", childName)
    console.log("dateStr:", dateStr)

    console.log("column5:", column5)
    console.log("column5Html:", column5Html)
    console.log("column6:", column6)
    console.log("column6Html:", column6Html)

    console.log("isAbsent:", isAbsent)
    console.log("hasEntered:", hasEntered)
    console.log("hasExited:", hasExited)
    console.log("isUIEnabled:", isUIEnabled)
    console.log("isStop:", isStop)
    console.log("loadingAction:", loadingAction)
    console.log("disabled:", disabled)

    console.log("canPostEnter(column5Html):", showEnter)
    console.log("canPostLeave(column6Html, column5):", showLeave)
    console.log("afternoonBlocked:", afternoonBlocked)

    console.log("表示結果:", {
      absenceBadge: isAbsent,
      enterTimeView: hasEntered,
      leaveTimeView: hasEntered && hasExited,
      showEnterButton: !isAbsent && !hasEntered && showEnter,
      showLeaveButton: !isAbsent && hasEntered && showLeave,
      showProfessionalSupport: !isAbsent && hasEntered && hasExited,
    })
    console.groupEnd()
  }, [
    childId,
    childName,
    dateStr,
    column5,
    column5Html,
    column6,
    column6Html,
    isAbsent,
    hasEntered,
    hasExited,
    isUIEnabled,
    isStop,
    loadingAction,
    disabled,
    showEnter,
    showLeave,
    afternoonBlocked,
  ])

  if (isAbsent) {
    return (
      <span className="hug-absence-badge" title={column5 || "欠席"}>
        {column5 || "欠席"}
      </span>
    )
  }

  if (hasEntered) {
    return (
      <>
        <div className="hug-time-field">
          <label htmlFor="hug-enter-time">入室</label>
          <input
            id="hug-enter-time"
            type="text"
            readOnly
            value={column5 || ""}
          />
        </div>

        {hasExited ? (
          <>
            <div className="hug-time-field">
              <label htmlFor="hug-leave-time">退室</label>
              <input
                id="hug-leave-time"
                type="text"
                readOnly
                value={column6 || ""}
              />
            </div>
            <button
              type="button"
              className="btn-purple mt-1 p-2 w-full text-sm"
              onClick={onProfessionalSupport}
              disabled={!isUIEnabled}
            >
              専門的支援
            </button>
          </>
        ) : showLeave ? (
          <div className="hug-post-actions mt-1">
            <AttendancePostButton
              action="leave"
              hasMail={hasLeaveMail(column6Html, childId, childName, dateStr)}
              disabled={disabled}
              loading={loadingAction === "leave"}
              title={buildLeaveButtonTitle(column6Html, childId, dateStr)}
              onClick={onLeave}
            />
          </div>
        ) : (
          <span className="hug-enter-cell-dash">退室ボタンなし</span>
        )}
      </>
    )
  }

  return (
    <div className="hug-post-actions">
      {showEnter ? (
        <AttendancePostButton
          action="enter"
          hasMail={hasEnterMail(column5Html, childId, childName, dateStr)}
          disabled={disabled || afternoonBlocked}
          loading={loadingAction === "enter"}
          title={buildEnterButtonTitle(column5Html, childId, dateStr)}
          onClick={onEnter}
        />
      ) : (
        <span className="hug-enter-cell-dash">入室ボタンなし</span>
      )}

      <button
        type="button"
        className="hug-btn-absence"
        disabled={disabled || !column5Html}
        onClick={onAbsence}
        title="欠席モーダルを開く（hugview Cache）"
      >
        {loadingAction === "absence" ? "処理中…" : "欠席"}
      </button>

      {afternoonBlocked ? (
        <p className="text-xs text-orange-700 w-full">
          午後枠：ハーフタイムまで入室できません
        </p>
      ) : null}
    </div>
  )
}