import { useEffect } from "react";
import { useProfessionalSupportCheck2 } from "./useProfessionalSupportCheck2";
import { useAppState } from "@/contexts/appState";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

/**
 * 専門的支援の利用日数チェック + 本日の専門的支援登録確認
 * 利用日数は（今月の個人記録の登録数＋１）相当のため、本日の個人記録登録済みなら表示は -1 する
 * @example
 * <ProfessionalSupportCheckPanel logTag="Sidebar" className="w-full px-1" buttonClassName="w-full text-xs" />
 */

const getUseDaysTextClass = (useDays, todayProfessionalSupportRegistered) => {
  console.log("[HUG WM] 利用日数テキスト色判定", {
    useDays,
    todayProfessionalSupportRegistered,
  });

  if (useDays == null) {
    console.log("[HUG WM] 利用日数テキスト色判定結果", {
      result: "",
      reason: "useDays is null",
    });
    return "";
  }

  if (todayProfessionalSupportRegistered === true) {
    console.log("[HUG WM] 利用日数テキスト色判定結果", {
      result: "text-gray-900",
      reason: "本日の専門的支援登録済み",
    });
    return "text-gray-900";
  }

  if (useDays < 2) {
    console.log("[HUG WM] 利用日数テキスト色判定結果", {
      result: "text-red-500",
      reason: "useDays < 2",
    });
    return "text-red-500";
  }

  console.log("[HUG WM] 利用日数テキスト色判定結果", {
    result: "text-blue-500",
    reason: "useDays >= 2",
  });
  return "text-blue-500";
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

const professionalSupportRegisteredLabel = (
  registered,
  checking,
  useDaysResult,
  currentYmd
) => {
  console.log("[HUG WM] 本日の専門的支援ラベル判定", {
    registered,
    checking,
    useDaysResult,
    currentYmd,
  });

  if (checking) {
    console.log("[HUG WM] 本日の専門的支援ラベル判定結果", {
      result: "確認中",
      reason: "checking === true",
      currentYmd,
      useDaysResult,
    });
    return "確認中…";
  }

  if (useDaysResult && useDaysResult.ok === false) {
    console.log("[HUG WM] 本日の専門的支援ラベル判定結果", {
      result: "取得失敗",
      reason: "useDaysResult.ok === false",
      error: useDaysResult.error,
      useDaysResult,
    });
    return "取得失敗";
  }

  const rows = useDaysResult?.rows ?? [];

  const hasTodayInterviewDate = rows.some((row) => {
    const interviewYmd = normalizeInterviewDateToYmd(row.interviewDate);

    console.log("[HUG WM] interviewDate 比較", {
      rawInterviewDate: row.interviewDate,
      interviewYmd,
      currentYmd,
      matched: interviewYmd === currentYmd,
      row,
    });

    return interviewYmd === currentYmd;
  });

  if (hasTodayInterviewDate) {
    console.log("[HUG WM] 本日の専門的支援ラベル判定結果", {
      result: "登録済み",
      reason: "interviewDate matches CURRENT_YMD",
      currentYmd,
      rows,
    });
    return "登録済み";
  }

  console.log("[HUG WM] 本日の専門的支援ラベル判定結果", {
    result: "未",
    reason: "no interviewDate matches CURRENT_YMD",
    currentYmd,
    rows,
  });

  return "未";
};

const getProfessionalSupportRegisteredClass = (
  registered,
  useDays,
  checking,
  useDaysResult,
  currentYmd
) => {
  console.log("[HUG WM] 本日の専門的支援文字色判定", {
    registered,
    useDays,
    checking,
    useDaysResult,
    currentYmd,
  });

  if (checking) {
    console.log("[HUG WM] 本日の専門的支援文字色判定結果", {
      result: "text-gray-400",
      reason: "checking",
    });
    return "text-gray-400";
  }

  if (useDaysResult && useDaysResult.ok === false) {
    console.log("[HUG WM] 本日の専門的支援文字色判定結果", {
      result: "text-red-500",
      reason: "useDaysResult.ok === false",
    });
    return "text-red-500";
  }

  const rows = useDaysResult?.rows ?? [];

  const hasTodayInterviewDate = rows.some((row) => {
    const interviewYmd = normalizeInterviewDateToYmd(row.interviewDate);
    return interviewYmd === currentYmd;
  });

  if (hasTodayInterviewDate) {
    console.log("[HUG WM] 本日の専門的支援文字色判定結果", {
      result: "text-green-600",
      reason: "interviewDate matches CURRENT_YMD",
      currentYmd,
    });
    return "text-green-600";
  }

  if (useDays != null && useDays >= 3) {
    console.log("[HUG WM] 本日の専門的支援文字色判定結果", {
      result: "text-blue-500",
      reason: "no today interviewDate && useDays >= 3",
    });
    return "text-blue-500";
  }

  console.log("[HUG WM] 本日の専門的支援文字色判定結果", {
    result: "text-orange-600",
    reason: "no today interviewDate && useDays < 3",
  });

  return "text-orange-600";
};

export default function ProfessionalSupportCheckPanel2({
  className = "",
  buttonClassName = "",
  labelClassName = "",
  logTag = "ProfessionalSupportCheck",
}) {
  const { CURRENT_YMD } = useAppState();

  const {
    useDays,
    useDaysDisplayKind,
    todayProfessionalSupportRegistered,
    todayProfessionalSupportRecordCount,
    lastUseDaysResult,
    checking,
    runCheck,
  } = useProfessionalSupportCheck2(logTag);

  console.log(`[HUG WM] ProfessionalSupportCheckPanel2 render（${logTag}）`, {
    CURRENT_YMD,
    useDays,
    useDaysDisplayKind,
    todayProfessionalSupportRegistered,
    todayProfessionalSupportRecordCount,
    lastUseDaysResult,
    checking,
    className,
    buttonClassName,
    labelClassName,
  });

  useEffect(() => {
    console.log(
      `[HUG WM] ProfessionalSupportCheckPanel2 state changed（${logTag}）`,
      {
        CURRENT_YMD,
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
    CURRENT_YMD,
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
    CURRENT_YMD
  );

  const registeredClass = getProfessionalSupportRegisteredClass(
    todayProfessionalSupportRegistered,
    useDays,
    checking,
    lastUseDaysResult,
    CURRENT_YMD
  );

  console.log(`[HUG WM] ProfessionalSupportCheckPanel2 表示値確定（${logTag}）`, {
    CURRENT_YMD,
    useDaysTextClass,
    registeredText,
    registeredClass,
    lastUseDaysResult,
    shouldShowRecordCount:
      todayProfessionalSupportRecordCount != null &&
      todayProfessionalSupportRecordCount > 0,
  });

  const handleClick = () => {
    console.log(`[HUG WM] 専門的支援チェックボタン押下（${logTag}）`, {
      CURRENT_YMD,
      checking,
      useDays,
      useDaysDisplayKind,
      todayProfessionalSupportRegistered,
      todayProfessionalSupportRecordCount,
      lastUseDaysResult,
    });

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
        >
          本日の専門的支援:{" "}
          <span className={`font-bold ${registeredClass}`}>
            {registeredText}
          </span>
        </label>
      </div>
    </div>
  );
}