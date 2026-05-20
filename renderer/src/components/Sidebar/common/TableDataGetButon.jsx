import React, { useState } from "react";
import { FaTable } from "react-icons/fa";
import { useAttendanceFetch } from "@/hooks/useAttendanceFetch.js";

/**
 * 今日の利用者（勤怠）データ取得ボタン
 */
export default function TableDataGetButton() {
  const { runFetch } = useAttendanceFetch("TableDataGetButton");
  const [open, setOpen] = useState(false);

  return (
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
          onClick={runFetch}
          className="flex items-center justify-center px-7 py-2 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
        >
          <FaTable size={16} />
        </button>
      </div>
    </div>
  );
}
