import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { usePersonRecordCheck } from "./usePersonRecordCheck";
import {
  selectCurrentYmd,
  selectSelectedChild,
} from "@/store/slices/appStateSlice.js";
import { selectPersonalRecordStatus } from "@/store/slices/recordStatusSlice.js";

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
    <span
      className={`font-bold ${registeredClass}`}
      title={
        recordCount != null
          ? `記録件数：${recordCount}件`
          : "記録件数：未取得"
      }
    >
      {registeredText}
    </span>
  );
}

/**
 * 個人記録 取得ボタン + 結果表示
 */
export default function PersonalRecordCheckPanel() {
  const { checking, runCheck } = usePersonRecordCheck();

  const currentYmd = useSelector(selectCurrentYmd);
  const selectedChildId = useSelector(selectSelectedChild);

  const personalRecordStatus = useSelector((state) =>
    selectPersonalRecordStatus(state, currentYmd, selectedChildId)
  );

  const todayPersonalRecordRegistered = personalRecordStatus.registered;
  const todayPersonalRecordCount = personalRecordStatus.recordCount;

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

      <span className="text-xs text-gray-600">
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