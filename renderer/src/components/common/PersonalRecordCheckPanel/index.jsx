import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { usePersonRecordCheck } from "./usePersonRecordCheck";

/**
 * 本日の個人記録登録状態ラベル
 *
 * @param {boolean | null | undefined} registered
 * @param {boolean} checking
 */
export const personalRecordRegisteredLabel = (registered, checking) => {
  if (checking) return "確認中…";
  if (registered === true) return "済";
  if (registered === false) return "未";

  return "未";
};

/**
 * 本日の個人記録登録状態の文字色
 *
 * @param {boolean | null | undefined} registered
 * @param {boolean} checking
 */
export const getPersonalRecordRegisteredClass = (registered, checking) => {
  if (checking) return "text-gray-400";

  if (registered === true) {
    return "text-green-600";
  }

  if (registered === false) {
    return "text-orange-600";
  }

  return "text-gray-400";
};

/**
 * 本日の個人記録登録状態表示
 */
export function PersonalRecordRegisteredStatus({
  registered,
  checking,
  recordCount,
}) {
  const registeredText = personalRecordRegisteredLabel(registered, checking);
  const registeredClass = getPersonalRecordRegisteredClass(
    registered,
    checking
  );

  return (
    <>
      <span className={`font-bold ${registeredClass}`}>
        {registeredText}
      </span>

      {recordCount != null && recordCount > 0 ? (
        <span className="text-gray-400">（{recordCount}件）</span>
      ) : null}
    </>
  );
}

/**
 * 個人記録 取得ボタン + 結果表示
 */
export default function PersonalRecordCheckPanel() {
  const {
    todayPersonalRecordRegistered,
    todayPersonalRecordCount,
    checking,
    runCheck,
  } = usePersonRecordCheck();

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={runCheck}
        disabled={checking}
        className={[
          "inline-flex items-center rounded px-2 py-1 text-sm font-medium",
          "border border-gray-300 bg-white text-gray-700",
          "hover:bg-gray-50",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {checking ? "取得中…" : "取得"}
      </button>

      <span className="text-sm text-gray-600">
        本日の個人：
      </span>

      <PersonalRecordRegisteredStatus
        registered={todayPersonalRecordRegistered}
        checking={checking}
        recordCount={todayPersonalRecordCount}
      />

      {todayPersonalRecordRegistered === true ? (
        <CheckCircleIcon
          className="h-4 w-4 text-green-600 shrink-0"
          title="本日の個人記録登録済み"
          aria-label="本日の個人記録登録済み"
        />
      ) : null}
    </div>
  );
}