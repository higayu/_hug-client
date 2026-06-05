import AttendancePostButton from "./AttendancePostButton.jsx";
import {
  canPostEnter,
  canPostLeave,
  hasEnterMail,
  hasLeaveMail,
  buildEnterButtonTitle,
  buildLeaveButtonTitle,
  isAfternoonEnterBlocked,
} from "@/utils/attendance/helpers/attendanceButtonHelpers.js";

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
  const disabled = !isUIEnabled || isStop || Boolean(loadingAction);
  const afternoonBlocked =
    !hasEntered && isAfternoonEnterBlocked(column5Html, childId, dateStr);

  if (isAbsent) {
    return (
      <span className="hug-absence-badge" title={column5 || "欠席"}>
        {column5 || "欠席"}
      </span>
    );
  }

  if (hasEntered) {
    const showLeave = !hasExited && canPostLeave(column6Html, column5);

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
    );
  }

  const showEnter = canPostEnter(column5Html);

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
  );
}
