import React, { useState } from "react";
import { FaTable } from "react-icons/fa";

import { useAppState } from "@/AppStateContext";
import { useAttendanceFetch } from "./useAttendanceFetch";

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
 * 利用者データ取得 UI
 *
 * - 自動取得トグル
 * - 手動取得ボタン
 * - 最終取得日時表示
 *
 * 取得処理はこのコンポーネント内部で実行する
 */
export default function GetTodayUsersChildren() {
  const [open, setOpen] = useState(false);

  const { attendanceData } = useAppState();

  const { runFetch, autoFetchEnabled, toggleAutoFetch } =
    useAttendanceFetch("GetTodayUsersChildren");

  const lastFetchedAt = attendanceData?.extractedAt ?? null;
  const fetchedAtLabel = formatLastFetchedAt(lastFetchedAt);

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="flex flex-row gap-2 items-center justify-center">
        <button
          type="button"
          className={
            autoFetchEnabled
              ? "btn-purple hover:bg-purple-600 p-2 rounded text-white text-xs shrink-0"
              : "bg-gray-400 hover:bg-gray-500 p-2 rounded text-white text-xs shrink-0"
          }
          onClick={toggleAutoFetch}
        >
          自動: {autoFetchEnabled ? "ON" : "OFF"}
        </button>

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
              onClick={() => runFetch()}
              className="flex items-center justify-center px-7 py-2 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
            >
              <FaTable size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-md bg-white py-1 px-2 flex flex-row gap-2 items-center text-center">
        <span className="text-sm font-bold text-gray-900">取得：</span>
        <span
          className={`text-sm font-extrabold ${
            lastFetchedAt ? "text-green-800" : "text-amber-700"
          }`}
        >
          {fetchedAtLabel}
        </span>
      </div>
    </div>
  );
}