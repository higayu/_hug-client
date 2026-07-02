import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useProfessionalSupportCheck2 } from "./useProfessionalSupportCheck2";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import {
  selectCurrentYmd,
  selectSelectedChild,
} from "@/store/slices/appStateSlice.js";
import { selectProfessionalSupportStatus } from "@/store/slices/recordStatusSlice.js";

/**
 * 専門的支援の利用日数チェック + 本日の専門的支援登録確認
 */

const getUseDaysTextClass = (useDays, todayProfessionalSupportRegistered) => {
  if (useDays == null) return "";

  if (useDays >= 2) {
    return "text-blue-500";
  }

  return "text-red-500";
};

const normalizeInterviewDateToYmd = (dateText) => {
  if (!dateText) return null;

  // 例: "2026年06月13日" -> "2026-06-13"
  const match = String(dateText).match(
    /^(\d{4})年(\d{1,2})月(\d{1,2})日$/
  );

  if (!match) return null;

  const [, year, month, day] = match;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const hasTodayProfessionalSupportRecord = (useDaysResult, currentYmd) => {
  const rows = useDaysResult?.rows ?? [];

  return rows.some((row) => {
    const interviewYmd = normalizeInterviewDateToYmd(row.interviewDate);
    return interviewYmd === currentYmd;
  });
};

const professionalSupportRegisteredLabel = (
  registered,
  checking,
  useDaysResult,
  currentYmd
) => {
  if (checking) return "確認中…";

  if (useDaysResult && useDaysResult.ok === false) {
    return "取得失敗";
  }

  if (registered === true) return "済";

  if (hasTodayProfessionalSupportRecord(useDaysResult, currentYmd)) {
    return "済";
  }

  return "未";
};

const getProfessionalSupportRegisteredClass = (
  registered,
  useDays,
  checking,
  useDaysResult,
  currentYmd
) => {
  if (checking) return "text-gray-400";

  if (useDaysResult && useDaysResult.ok === false) {
    return "text-red-500";
  }

  if (
    registered === true ||
    hasTodayProfessionalSupportRecord(useDaysResult, currentYmd)
  ) {
    return "text-green-600";
  }

  if (useDays != null && useDays >= 2) {
    return "text-blue-500";
  }

  return "text-orange-600";
};

export default function ProfessionalSupportCheckPanel2({
  className = "",
  buttonClassName = "",
  labelClassName = "",
  logTag = "ProfessionalSupportCheck",
}) {
  const currentYmd = useSelector(selectCurrentYmd);
  const selectedChildId = useSelector(selectSelectedChild);

  const professionalSupportStatus = useSelector((state) =>
    selectProfessionalSupportStatus(state, currentYmd, selectedChildId)
  );

  const { checking, runCheck } = useProfessionalSupportCheck2(logTag);

  const useDays = professionalSupportStatus.useDays;
  const useDaysDisplayKind = professionalSupportStatus.useDaysDisplayKind;
  const todayProfessionalSupportRegistered =
    professionalSupportStatus.registered;
  const todayProfessionalSupportRecordCount =
    professionalSupportStatus.recordCount;
  const lastUseDaysResult = professionalSupportStatus.lastUseDaysResult;

  useEffect(() => {
    console.log(
      `[HUG WM] ProfessionalSupportCheckPanel2 store state changed（${logTag}）`,
      {
        currentYmd,
        selectedChildId,
        useDays,
        useDaysDisplayKind,
        todayProfessionalSupportRegistered,
        todayProfessionalSupportRecordCount,
        lastUseDaysResult,
        checking,
      }
    );
  }, [
    logTag,
    currentYmd,
    selectedChildId,
    useDays,
    useDaysDisplayKind,
    todayProfessionalSupportRegistered,
    todayProfessionalSupportRecordCount,
    lastUseDaysResult,
    checking,
  ]);

  const useDaysTextClass = getUseDaysTextClass(
    useDays,
    todayProfessionalSupportRegistered
  );

  const registeredText = professionalSupportRegisteredLabel(
    todayProfessionalSupportRegistered,
    checking,
    lastUseDaysResult,
    currentYmd
  );

  const registeredClass = getProfessionalSupportRegisteredClass(
    todayProfessionalSupportRegistered,
    useDays,
    checking,
    lastUseDaysResult,
    currentYmd
  );

  const handleClick = () => {
    runCheck();
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <button
        type="button"
        className={
          `btn-purple hover:bg-purple-600 p-2 rounded text-white shrink-0 disabled:opacity-60 ${buttonClassName}`.trim()
        }
        onClick={handleClick}
        disabled={checking}
      >
        {checking ? "確認中…" : "専門的支援チェック"}
      </button>

      <div className="flex gap-1 items-stretch">
        <label
          className={
            `flex-1 bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
          }
          title={
            lastUseDaysResult?.label ||
            (useDays != null ? `保存件数：${useDays}個` : "保存件数：未取得")
          }
        >
          保存件数:{" "}
          {useDays != null ? (
            <span
              className={`inline-flex items-center justify-center gap-1 font-bold text-base ${useDaysTextClass}`}
            >
              <span>{useDays}個</span>

              {useDays >= 2 ? (
                <span
                  className="inline-flex items-center justify-center text-green-600"
                  aria-label="保存件数2個以上"
                  title="保存件数2個以上"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 shrink-0" />
                </span>
              ) : null}
            </span>
          ) : (
            "未"
          )}
        </label>

        <label
          className={
            `flex-1 bg-white text-xs text-gray-500 p-1.5 rounded text-center ${labelClassName}`.trim()
          }
          title={
            checking
              ? "本日の専門的支援登録状況：確認中"
              : lastUseDaysResult?.ok === false
                ? "本日の専門的支援登録状況：取得失敗"
                : todayProfessionalSupportRecordCount != null
                  ? `本日の専門的支援登録状況：${registeredText}（当日保存件数：${todayProfessionalSupportRecordCount}件）`
                  : "本日の専門的支援登録状況：未取得"
          }
        >
          本日の専門:{" "}
          <span className={`font-bold ${registeredClass}`}>
            {registeredText}
          </span>
        </label>
      </div>
    </div>
  );
}