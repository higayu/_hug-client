import React, { useCallback } from "react";
import { FaTable } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useTabs } from "../../../hooks/useTabs/index.js";
import { useAppState } from "../../../contexts/AppStateContext.jsx";
import { createWebview, createTabButton } from "../../../hooks/useTabs/common/index.js";
import { fetchAndExtractAttendanceData } from "../../../store/slices/attendanceSlice.js";
import { useToast } from "../../../contexts/ToastContext.jsx";
import { handleAttendancePageLoad } from "../../../utils/ToDayChildrenList/attendancePageHandler.js";

/**
 * メインコンポーネント
 */
export default function TableDataGetButton() {
  const dispatch = useDispatch();
  const { appState, updateAppState } = useAppState();
  const { activateTab, closeTab } = useTabs();
  const { showInfoToast } = useToast();

  const handleOpenAttendance = useCallback(async () => {
    const tabsContainer = document.getElementById("tabs");
    const webviewContainer = document.getElementById("webview-container");

    if (!tabsContainer || !webviewContainer) {
      console.error("❌ tabs または webview-container が見つかりません");
      showInfoToast("タブ領域が見つかりません。");
      return;
    }

    const facility_id = appState.SELECT_FACILITY_ID || appState.FACILITY_ID || "1";
    const date_str = appState.DATE_STR || new Date().toISOString().slice(0, 10);

    const newId = `attendance-${Date.now()}`;
    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facility_id}&date=${date_str}`;
    console.log("📅 勤怠タブ作成:", targetUrl);

    const newWebview = createWebview(newId, targetUrl);
    webviewContainer.appendChild(newWebview);

    const tabButton = createTabButton(newId, `勤怠表(${date_str})`, appState.closeButtonsVisible);
    if (!tabButton) return;
    tabsContainer.appendChild(tabButton);

    tabButton.addEventListener("click", () => activateTab(newId));

    const closeBtn = tabButton.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm("このタブを閉じますか？")) return;
        closeTab(newId);
      });
    }

    // ✅ 関数を呼び出すだけで処理がスッキリ！
    newWebview.addEventListener(
      "did-finish-load",
      () =>
        handleAttendancePageLoad({
          newWebview,
          targetUrl,
          facility_id,
          date_str,
          dispatch,
          updateAppState,
          showInfoToast,
        }),
      { once: true }
    );

    activateTab(newId);
  }, [appState, activateTab, closeTab, dispatch, updateAppState]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-2">
      <button
        onClick={handleOpenAttendance}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md py-2"
      >
        <FaTable size={18} />
        <span>勤怠データ取得</span>
      </button>
    </div>
  );
}
