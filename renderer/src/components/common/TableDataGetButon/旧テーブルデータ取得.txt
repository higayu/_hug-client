import React, { useCallback, useState } from "react";
import { FaTable } from "react-icons/fa";
import { useDispatch } from "react-redux";
//import { useAppState } from "@/contexts/AppStateContext.jsx";
import { useAppState } from '@/contexts/appState';
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
  const [open, setOpen] = useState(false);

  const handleOpenAttendance = useCallback(async () => {
    // 専用タブ（hugview-first-button）を強制的にアクティブにする
    activateHugViewFirstButton();
  
    const hugWebview = document.getElementById("hugview");
    if (!hugWebview) {
      console.error("❌ hugview webviewが見つかりません");
      showInfoToast("専用タブが見つかりません。");
      return;
    }
  
    const facility_id = appState.SELECT_FACILITY_ID || appState.FACILITY_ID || "1";
    const date_str = appState.CURRENT_YMD || new Date().toISOString().slice(0, 10);
  
    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facility_id}&date=${date_str}`;
    console.log("📅 勤怠データ取得:", targetUrl);
  
    const currentSrc = hugWebview.getURL?.() || "";
  
    // ▼ URL が既に同じ → 最新化してすぐ取得
    if (currentSrc.includes(targetUrl)) {
      console.log("⚡ 既に同じURLを読み込み中 → 最新化して再取得");
  
      hugWebview.reloadIgnoringCache();
  
      hugWebview.addEventListener(
        "did-finish-load",
        () => {
          handleAttendancePageLoad({
            newWebview: hugWebview,
            targetUrl,
            facility_id,
            date_str,
            dispatch,
            updateAppState,
            showInfoToast,
          });
        },
        { once: true }
      );
  
      return;
    }
  
    // ▼ URL を新しく設定
    hugWebview.src = targetUrl;
  
    // ▼ 1回目のロード完了 → 最新化のため再リロード
    hugWebview.addEventListener(
      "did-finish-load",
      () => {
        const loadedUrl = hugWebview.getURL?.() || "";
        if (!loadedUrl.includes(targetUrl)) return;
  
        console.log("♻️ 一度目のロード完了 → キャッシュ無視で強制再読み込み");
  
        hugWebview.reloadIgnoringCache();
  
        // ▼ 最新化（2回目のロード）完了後に本処理
        hugWebview.addEventListener(
          "did-finish-load",
          () => {
            console.log("🔄 最新ページロード完了 → データ取得を実行");
  
            handleAttendancePageLoad({
              newWebview: hugWebview,
              targetUrl,
              facility_id,
              date_str,
              dispatch,
              updateAppState,
              showInfoToast,
            });
          },
          { once: true }
        );
      },
      { once: true }
    );
  }, [appState, dispatch, updateAppState, showInfoToast]);
  

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Tooltip */}
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
          onClick={handleOpenAttendance}
          className="flex items-center justify-center px-7 py-2 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
        >
          <FaTable size={16} />
        </button>
      </div>
    </div>
  );
  
}

