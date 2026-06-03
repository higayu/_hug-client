import React, { useState } from "react";
import { FaTable } from "react-icons/fa";

/**
 * 勤怠データ取得 UI（自動取得トグル + 手動取得）
 * @param {{
 *   onFetch?: () => void | Promise<void>,
 *   autoFetchEnabled?: boolean,
 *   onToggleAutoFetch?: () => void,
 * }} props
 */
export default function TableDataGetButton({
  onFetch,
  autoFetchEnabled,
  onToggleAutoFetch,
}) {
  const [open, setOpen] = useState(false);

  if (!onFetch) {
    console.warn("[TableDataGetButton] onFetch が未指定です");
  }

  return (
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
  );
}
