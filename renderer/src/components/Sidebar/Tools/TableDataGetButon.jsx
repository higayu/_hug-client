import React, { useCallback } from "react";
import { FaTable } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useTabs } from "../../../hooks/useTabs/index.js";
import { useAppState } from "../../../contexts/AppStateContext.jsx";
import { createWebview, createTabButton } from "../../../hooks/useTabs/common/index.js";
import { fetchAndExtractAttendanceData } from "../../../store/slices/attendanceSlice.js";

export default function FetchAttendanceButton() {
  const dispatch = useDispatch();
  const { appState, updateAppState } = useAppState();
  const { activateTab, closeTab } = useTabs();

  const handleOpenAttendance = useCallback(async () => {
    const tabsContainer = document.getElementById("tabs");
    const webviewContainer = document.getElementById("webview-container");

    if (!tabsContainer || !webviewContainer) {
      console.error("❌ tabs または webview-container が見つかりません");
      alert("タブ領域が見つかりません。");
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

    // === ページロード完了後にテーブル抽出 ===
    newWebview.addEventListener(
      "did-finish-load",
      async () => {
        console.log("✅ 勤怠ページロード完了:", targetUrl);
        try {
          const selector = "table";
          let result;

          try {
            const selectorStr = JSON.stringify(selector);

            result = await newWebview.executeJavaScript(`
              (function() {
                try {
                  var selector = ${selectorStr};
                  var table = null;

                  try {
                    table = document.querySelector(selector);
                  } catch (e) {
                    console.warn("⚠️ [ATTENDANCE] セレクターエラー:", e.message);
                  }

                  if (!table) {
                    table = document.querySelector("table");
                  }

                  if (!table) {
                    var tables = document.querySelectorAll("table");
                    if (tables.length > 0) {
                      table = tables[0];
                    }
                  }

                  if (!table) {
                    return {
                      success: false,
                      error: "テーブルが見つかりません",
                      html: null,
                      pageTitle: document.title || "",
                      pageUrl: window.location.href || "",
                      debugInfo: {
                        bodyHTMLLength: document.body ? document.body.innerHTML.length : 0,
                        allElementsCount: document.querySelectorAll('*').length,
                        readyState: document.readyState
                      }
                    };
                  }

                  var rows = table.querySelectorAll("tr");
                  var htmlString = table.outerHTML;
                  var htmlSize = htmlString.length;

                  return {
                    success: true,
                    html: htmlString,
                    className: table.className || "",
                    rowCount: rows.length,
                    pageTitle: document.title || "",
                    pageUrl: window.location.href || "",
                    htmlSize: htmlSize
                  };
                } catch (error) {
                  return {
                    success: false,
                    error: "JavaScript実行エラー: " + (error.message || String(error)),
                    html: null,
                    pageTitle: document.title || "不明",
                    pageUrl: window.location.href || "不明",
                    debugInfo: {
                      errorName: error.name || "",
                      errorMessage: error.message || String(error),
                      readyState: document.readyState || ""
                    }
                  };
                }
              })();
            `);
          } catch (jsError) {
            console.error("❌ [ATTENDANCE] executeJavaScript実行エラー:", jsError);
            throw new Error(`JavaScript実行エラー: ${jsError.message}`);
          }

          // === Reduxで取得＋抽出 ===
          if (result?.success && result.html) {
            const reduxResult = await dispatch(
              fetchAndExtractAttendanceData({
                facility_id,
                date_str,
                options: { html: result.html },
              })
            );

            // === 成否チェック ===
            if (!fetchAndExtractAttendanceData.fulfilled.match(reduxResult)) {
              throw new Error(reduxResult.payload || reduxResult.error || "不明なエラー");
            }

            const { tableData, extractedData } = reduxResult.payload;
            console.log("✅ [ATTENDANCE] 抽出成功:", tableData);

            // === appStateへ保存 ===
            if (extractedData) {
              const attendanceData = {
                facilityId: facility_id,
                dateStr: date_str,
                extractedAt: new Date().toISOString(),
                rowCount: extractedData.rowCount,
                data: extractedData.data,
              };

              updateAppState({ attendanceData });
              if (window.AppState) window.AppState.attendanceData = attendanceData;

              // === Electron側へ保存（任意） ===
              if (window.electronAPI?.saveAttendanceColumnData) {
                await window.electronAPI.saveAttendanceColumnData({
                  facilityId: facility_id,
                  dateStr: date_str,
                  extractedData: extractedData.data,
                });
              }

              alert(`✅ 勤怠データを抽出・保存しました。\n行数: ${attendanceData.rowCount || "不明"}`);
            } else {
              alert("⚠️ データ抽出に失敗しました（テーブルは取得済み）");
            }
          } else {
            alert(`⚠️ 取得失敗: ${result?.error || "不明なエラー"}`);
          }
        } catch (error) {
          console.error("❌ 勤怠データ取得エラー:", error);
          alert(`❌ エラー: ${error.message}`);
        }
      },
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
