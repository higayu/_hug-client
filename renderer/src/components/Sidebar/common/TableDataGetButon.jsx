import React, { useCallback } from "react";
import { FaTable } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useAppState } from "@/contexts/AppStateContext.jsx";
import { activateHugViewFirstButton } from "@/hooks/useTabs/common/index.js";
import { useToast } from  '@/components/common/ToastContext.jsx'
import { handleAttendancePageLoad } from "@/utils/ToDayChildrenList/attendancePageHandler.js";

/**
 * メインコンポーネント
 */
export default function TableDataGetButton() {
  const dispatch = useDispatch();
  const { appState, updateAppState } = useAppState();
  const { showInfoToast } = useToast();

  const handleOpenAttendance = useCallback(async () => {
    // 専用タブ（hugview-first-button）を強制的にアクティブにする
    activateHugViewFirstButton();

    // hugviewのwebviewを取得
    const hugWebview = document.getElementById("hugview");
    if (!hugWebview) {
      console.error("❌ hugview webviewが見つかりません");
      showInfoToast("専用タブが見つかりません。");
      return;
    }

    const facility_id = appState.SELECT_FACILITY_ID || appState.FACILITY_ID || "1";
    const date_str = appState.DATE_STR || new Date().toISOString().slice(0, 10);

    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facility_id}&date=${date_str}`;
    console.log("📅 勤怠データ取得:", targetUrl);

    // URLが変更される場合のみ再読み込み
    const currentSrc = hugWebview.getURL?.() || "";
    if (!currentSrc.includes(targetUrl)) {
      hugWebview.src = targetUrl;
    } else {
      console.log("⚡ 既に同じURLを読み込み中のため再ロードをスキップ:", currentSrc);
      // 既に同じURLの場合は、すぐにデータ取得処理を実行
      handleAttendancePageLoad({
        newWebview: hugWebview,
        targetUrl,
        facility_id,
        date_str,
        dispatch,
        updateAppState,
        showInfoToast,
      });
      return;
    }

    // ページが読み込まれたらデータ取得処理を実行
    hugWebview.addEventListener(
      "did-finish-load",
      () => {
        // URLが一致する場合のみ処理を実行
        const loadedUrl = hugWebview.getURL?.() || "";
        if (loadedUrl.includes(targetUrl)) {
          handleAttendancePageLoad({
            newWebview: hugWebview,
            targetUrl,
            facility_id,
            date_str,
            dispatch,
            updateAppState,
            showInfoToast,
          });
        }
      },
      { once: true }
    );
  }, [appState, dispatch, updateAppState, showInfoToast]);

  return (
    <div className="items-center justify-center">
      <button
        onClick={handleOpenAttendance}
        className="items-center justify-center p-3 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
      >
        <FaTable size={18} />
      </button>
    </div>
  );
}
