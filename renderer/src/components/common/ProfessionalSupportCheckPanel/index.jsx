import { useProfessionalSupportCheck } from "@/hooks/useProfessionalSupportCheck.js";

/**
 * 専門的支援の利用日数チェック + 本日の支援加算登録確認
 *
 * @example
 * <ProfessionalSupportCheckPanel logTag="Sidebar" className="w-full px-1" buttonClassName="w-full text-xs" />
 */
const todayRegisteredLabel = (registered, checking) => {
  if (checking) return "確認中…";
  if (registered === true) return "登録済み";
  if (registered === false) return "未登録";
  return "未取得";
};

export default function ProfessionalSupportCheckPanel({
  className = "",
  buttonClassName = "",
  labelClassName = "",
  logTag = "ProfessionalSupportCheck",
}) {
  const { useDays, todayRegistered, todayRecordCount, checking, runCheck } =
    useProfessionalSupportCheck(logTag);

  const registeredText = todayRegisteredLabel(todayRegistered, checking);
  const registeredClass =
    todayRegistered === true
      ? "text-green-600"
      : todayRegistered === false
        ? "text-orange-600"
        : "text-gray-400";

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
            <span>
              <span className="font-bold text-lg text-blue-500">{useDays}</span>日
            </span>
          ) : (
            "未取得"
          )}
        </label>
        <label
          className={
            `flex-1 bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
          }
        >
          本日の支援加算:{" "}
          <span className={`font-bold ${registeredClass}`}>{registeredText}</span>
          {todayRecordCount != null && todayRecordCount > 0 ? (
            <span className="text-gray-400">（{todayRecordCount}件）</span>
          ) : null}
        </label>
      </div>
    </div>
  );
}
