import { useProfessionalSupportCheck2 } from "@/hooks/useProfessionalSupportCheck.js";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

/**
 * 専門的支援の利用日数チェック + 本日の専門的支援登録確認
 * 利用日数は（今月の個人記録の登録数＋１）相当のため、本日の個人記録登録済みなら表示は -1 する
 * @example
 * <ProfessionalSupportCheckPanel logTag="Sidebar" className="w-full px-1" buttonClassName="w-full text-xs" />
 */

/** @param {'adjusted' | 'raw' | null} kind */
function UseDaysKindIcon({ kind }) {
  if (kind !== "adjusted") return null;

  return (
    <span
      className="inline-flex align-middle ml-0.5"
      title="本日の個人記録登録済みのため、利用日数を -1 して表示"
      aria-label="補正あり（-1）"
    >
      <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 shrink-0" />
    </span>
  );
}

const getUseDaysTextClass = (useDays, todayProfessionalSupportRegistered) => {
  if (useDays == null) return "";
  if (todayProfessionalSupportRegistered === true) {
    return "text-gray-900";
  }
  if (useDays < 3) return "text-red-500";
  return "text-blue-500";
};

const professionalSupportRegisteredLabel = (registered, checking) => {
  if (checking) return "確認中…";
  if (registered === true) return "登録済み";
  if (registered === false) return "未";
  return "未";
};

const getProfessionalSupportRegisteredClass = (registered, useDays, checking) => {
  if (checking) return "text-gray-400";
  if (registered === true) return "text-green-600";
  if (registered === false) {
    if (useDays != null && useDays >= 3) return "text-blue-500";
    return "text-orange-600";
  }
  return "text-gray-400";
};

export default function ProfessionalSupportCheckPanel2({
  className = "",
  buttonClassName = "",
  labelClassName = "",
  logTag = "ProfessionalSupportCheck",
}) {
  const {
    useDays,
    useDaysDisplayKind,
    todayProfessionalSupportRegistered,
    todayProfessionalSupportRecordCount,
    checking,
    runCheck,
  } = useProfessionalSupportCheck2(logTag);

  const useDaysTextClass = getUseDaysTextClass(
    useDays,
    todayProfessionalSupportRegistered
  );

  const registeredText = professionalSupportRegisteredLabel(
    todayProfessionalSupportRegistered,
    checking
  );
  const registeredClass = getProfessionalSupportRegisteredClass(
    todayProfessionalSupportRegistered,
    useDays,
    checking
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <button
        type="button"
        className={
          `btn-purple hover:bg-purple-600 p-2 rounded text-white shrink-0 disabled:opacity-60 ${buttonClassName}`.trim()
        }
        onClick={runCheck}
        disabled={checking}
      >
        {checking ? "確認中…" : "専門的支援チェック"}
      </button>
      <div className="flex gap-1 items-stretch">
        <label
          className={
            `flex-1 bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
          }
        >
          利用日数:{" "}
          {useDays != null ? (
            <span
              className={`inline-flex items-center justify-center gap-0 font-bold text-base ${useDaysTextClass}`}
            >
              <span>
                {useDays}日
              </span>
              <UseDaysKindIcon kind={useDaysDisplayKind} />
            </span>
          ) : (
            "未"
          )}
        </label>
        <label
          className={
            `flex-1 bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
          }
        >
          本日の専門的支援:{" "}
          <span className={`font-bold ${registeredClass}`}>{registeredText}</span>
          {todayProfessionalSupportRecordCount != null &&
          todayProfessionalSupportRecordCount > 0 ? (
            <span className="text-gray-400">
              （{todayProfessionalSupportRecordCount}件）
            </span>
          ) : null}
        </label>
      </div>
    </div>
  );
}
