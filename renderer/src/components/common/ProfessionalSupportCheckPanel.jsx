import { useProfessionalSupportCheck } from "@/hooks/useProfessionalSupportCheck.js";

/**
 * 専門的支援の利用日数チェック（ボタン + 利用日数ラベル）
 *
 * @example
 * <ProfessionalSupportCheckPanel logTag="Sidebar" className="w-full px-1" buttonClassName="w-full text-xs" />
 */
export default function ProfessionalSupportCheckPanel({
  className = "",
  buttonClassName = "",
  labelClassName = "",
  logTag = "ProfessionalSupportCheck",
}) {
  const { useDays, runCheck } = useProfessionalSupportCheck(logTag);

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <button
        type="button"
        className={
          `btn-purple hover:bg-purple-600 p-2 rounded text-white shrink-0 ${buttonClassName}`.trim()
        }
        onClick={runCheck}
      >
        専門的支援チェック
      </button>
      <label
        className={
          `bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
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
    </div>
  );
}
