import React, { useState } from "react";
import { FaTable } from "react-icons/fa";

function formatLastFetchedAt(extractedAt) {
  if (!extractedAt) return "未取得";

  const date = new Date(extractedAt);
  if (Number.isNaN(date.getTime())) return "未取得";

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 勤怠データ取得 UI（自動取得トグル + 手動取得）
 * @param {{
 *   onFetch?: () => void | Promise<void>,
 *   autoFetchEnabled?: boolean,
 *   onToggleAutoFetch?: () => void,
 *   lastFetchedAt?: string | null,
 * }} props
 */
export default function TableDataGetButton({
  onFetch,
  autoFetchEnabled,
  onToggleAutoFetch,
  lastFetchedAt,
}) {
  const [open, setOpen] = useState(false);

  if (!onFetch) {
    console.warn("[TableDataGetButton] onFetch が未指定です");
  }

  const fetchedAtLabel = formatLastFetchedAt(lastFetchedAt);

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="flex flex-row gap-2 items-center justify-center">
        {onToggleAutoFetch != null && (
          <button
            type="button"
            className={
              autoFetchEnabled
                ? "btn-purple hover:bg-purple-600 p-2 rounded text-white text-xs shrink-0"
                : "bg-gray-400 hover:bg-gray-500 p-2 rounded text-white text-xs shrink-0"
            }
            onClick={onToggleAutoFetch}
          >
            自動: {autoFetchEnabled ? "ON" : "OFF"}
          </button>
        )}

        <div className="flex items-center justify-center">
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {open && (
              <div
                className="
                  absolute
                  bottom-full
                  left-1/2
                  -translate-x-1/2
                  mb-2
                  whitespace-nowrap
                  rounded-md
                  bg-black
                  px-3
                  py-1
                  text-xs
                  text-white
                  shadow-lg
                  z-50
                "
              >
                今日の利用者のデータ取得
              </div>
            )}

            <button
              type="button"
              onClick={() => onFetch?.()}
              className="flex items-center justify-center px-7 py-2 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
            >
              <FaTable size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <span className="text-xs text-gray-500">最終取得時刻</span>
        <span
          className={`text-xs font-medium ${
            lastFetchedAt ? "text-gray-800" : "text-amber-600"
          }`}
        >
          {fetchedAtLabel}
        </span>
      </div>
    </div>
  );
}
