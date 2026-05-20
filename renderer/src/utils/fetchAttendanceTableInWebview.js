/**
 * アクティブ webview の HUG セッションで勤怠テーブル HTML を取得する。
 * （renderer の fetch では Cookie が付かないため webview 内で実行）
 *
 * @param {Electron.WebviewTag} webview
 * @param {{ facilityId: string, dateStr: string }} opts
 * @returns {Promise<
 *   | { ok: true; html: string; rowCount: number; pageTitle: string; pageUrl: string }
 *   | { ok: false; error: string }
 * >}
 */
export async function fetchAttendanceTableInWebview(webview, opts) {
  const { facilityId, dateStr } = opts || {};

  if (!webview) {
    return { ok: false, error: "webview がありません" };
  }
  if (!facilityId || !dateStr) {
    return { ok: false, error: "施設IDまたは日付がありません" };
  }

  const script = `
    (async () => {
      const F_ID = ${JSON.stringify(String(facilityId))};
      const DATE_STR = ${JSON.stringify(String(dateStr))};
      // Google拡張（ページリクエスト/content2.js）と同じベースURL + 施設・日付
      const params = new URLSearchParams({
        mode: "detail",
        f_id: F_ID,
        date: DATE_STR
      });
      const TARGET_URL =
        "https://www.hug-ayumu.link/hug/wm/attendance.php?" + params.toString();

      const extractTableFromDocument = (doc) => {
        // content1.js と同じ一覧テーブル（なければフォールバック）
        let table = doc.querySelector(
          "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
        );
        if (!table) table = doc.querySelector("table");
        if (!table) {
          const tables = doc.querySelectorAll("table");
          if (tables.length > 0) table = tables[0];
        }
        if (!table) return null;

        const rows = table.querySelectorAll("tr");
        return {
          html: table.outerHTML,
          rowCount: rows.length,
          className: table.className || ""
        };
      };

      try {
        console.log("[HUG WM] fetch開始:", TARGET_URL);

        // content2.js と同じリクエスト形（GET + credentials: include のみ）
        const response = await fetch(TARGET_URL, {
          method: "GET",
          credentials: "include"
        });

        console.log("[HUG WM] status:", response.status);
        console.log("[HUG WM] ok:", response.ok);
        console.log("[HUG WM] response URL:", response.url);

        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }

        const pageHtml = await response.text();
        const doc = new DOMParser().parseFromString(pageHtml, "text/html");

        const isLoginPage =
          doc.querySelector('input[name="username"]') !== null ||
          (doc.title || "").includes("ログイン") ||
          pageHtml.includes("login.php");

        if (isLoginPage) {
          throw new Error(
            "ログインページが返されました。HUGへのログイン状態を確認してください"
          );
        }

        const tableResult = extractTableFromDocument(doc);
        if (!tableResult) {
          throw new Error("テーブルが見つかりません");
        }

        console.log("[HUG WM] 勤怠テーブル取得（拡張機能と同様の fetch）", {
          facilityId: F_ID,
          dateStr: DATE_STR,
          rowCount: tableResult.rowCount
        });

        return {
          ok: true,
          html: tableResult.html,
          rowCount: tableResult.rowCount,
          className: tableResult.className,
          pageTitle: doc.title || "",
          pageUrl: response.url || TARGET_URL
        };
      } catch (error) {
        console.error("[HUG WM] 勤怠テーブル取得エラー:", error);
        return {
          ok: false,
          error: error && error.message ? String(error.message) : String(error)
        };
      }
    })()
  `;

  try {
    return await webview.executeJavaScript(script);
  } catch (e) {
    return {
      ok: false,
      error: e && e.message ? String(e.message) : String(e),
    };
  }
}
