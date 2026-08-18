/**
 * アクティブ webview の HUG セッションで個人記録（contact_book）一覧を取得し、
 * 出席行の編集ページから活動内容（note）を読み取る。
 */
export async function fetchPersonalRecordList(webview, opts) {
  const {
    childId,
    facilityId = "3",
    dateStart,
    dateEnd,
    onlyPresent = true,
  } = opts || {};

  if (!webview) {
    return { ok: false, error: "webview がありません" };
  }
  if (!childId) {
    return { ok: false, error: "児童ID（childId）がありません" };
  }
  if (!dateStart || !dateEnd) {
    return { ok: false, error: "期間（dateStart / dateEnd）がありません" };
  }

  const script = `
    (async () => {
      const C_ID = ${JSON.stringify(String(childId))};
      const F_ID = ${JSON.stringify(String(facilityId))};
      const DATE_START = ${JSON.stringify(String(dateStart))};
      const DATE_END = ${JSON.stringify(String(dateEnd))};
      const ONLY_PRESENT = ${onlyPresent ? "true" : "false"};
      const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";
      const TABLE_SELECTOR =
        'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]';

      var parseEditPath = function(onclick) {
        var match = String(onclick || "").match(/location\\.href='([^']+)'/);
        return match ? match[1] : "";
      };

      var isLoginPage = function(doc, html) {
        return doc.querySelector('input[name="username"]') !== null ||
          (doc.title || "").includes("ログイン") ||
          String(html || "").includes("login.php");
      };

      // 権限エラーチェック
      var hasPermissionError = function(doc) {
        var cautionBox = doc.querySelector('.caution-box.print');
        if (!cautionBox) return false;
        
        var cautionTitle = cautionBox.querySelector('h4.caution-title');
        if (!cautionTitle) return false;
        
        var text = cautionTitle.textContent || '';
        return text.includes('編集権限がありません') || text.includes('権限がありません');
      };

      // 権限エラーメッセージを取得
      var getPermissionErrorMessage = function(doc) {
        var cautionBox = doc.querySelector('.caution-box.print');
        if (!cautionBox) return null;
        
        var cautionTitle = cautionBox.querySelector('h4.caution-title');
        if (!cautionTitle) return null;
        
        return cautionTitle.textContent ? cautionTitle.textContent.trim() : null;
      };

      var fetchContactBookNote = async function(pathAndQuery) {
        var editUrl = new URL(pathAndQuery, HUG_WM_BASE_URL).href;

        console.log("[HUG WM] 編集ページ取得開始:", editUrl);

        var response = await fetch(editUrl, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("編集HTML取得エラー: " + response.status);
        }

        var html = await response.text();
        var editDoc = new DOMParser().parseFromString(html, "text/html");

        if (isLoginPage(editDoc, html)) {
          throw new Error(
            "ログインページが返されました。HUGへのログイン状態を確認してください"
          );
        }

        // 権限エラーチェック
        if (hasPermissionError(editDoc)) {
          var errorMsg = getPermissionErrorMessage(editDoc);
          console.warn("[HUG WM] 権限エラー検出:", errorMsg);
          throw new Error(errorMsg || "編集権限がありません");
        }

        var textarea = editDoc.querySelector(
          'textarea[name="note"][data-field-key="note"]'
        );

        if (!textarea) {
          var allTextareas = editDoc.querySelectorAll('textarea');
          console.log("[HUG WM] 見つかったtextarea数:", allTextareas.length);
          
          if (editDoc.querySelector('.caution-box.print')) {
            throw new Error("編集権限がないため、noteを取得できません");
          }
          throw new Error("note の textarea が見つかりませんでした");
        }

        var noteValue = (textarea.value || "").trim();
        console.log("[HUG WM] note取得成功:", {
          length: noteValue.length,
          preview: noteValue.substring(0, 50) + (noteValue.length > 50 ? "..." : "")
        });

        return noteValue;
      };

      try {
        var listParams = new URLSearchParams({
          f_id: F_ID,
          date: DATE_START,
          date_end: DATE_END,
          id: C_ID
        });
        var listUrl = HUG_WM_BASE_URL + "contact_book.php?" + listParams.toString();

        console.log("[HUG WM] 個人記録 一覧 fetch開始:", listUrl);

        var listResponse = await fetch(listUrl, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        if (!listResponse.ok) {
          throw new Error("一覧HTML取得エラー: " + listResponse.status);
        }

        var listHtml = await listResponse.text();
        var listDoc = new DOMParser().parseFromString(listHtml, "text/html");

        if (isLoginPage(listDoc, listHtml)) {
          throw new Error(
            "ログインページが返されました。HUGへのログイン状態を確認してください"
          );
        }

        var table = listDoc.querySelector(TABLE_SELECTOR);
        if (!table) {
          throw new Error("対象テーブルが見つかりませんでした");
        }

        var rows = Array.from(table.querySelectorAll("tbody tr"));
        var editTargets = rows
          .map(function(row) {
            var cells = row.querySelectorAll("td");
            var dateText = (cells[0] ? cells[0].textContent || "" : "").trim();
            var childName = (cells[1] ? cells[1].textContent || "" : "")
              .trim()
              .replace(/\\s+/g, " ");
            var attendanceText = (cells[4] ? cells[4].textContent || "" : "").trim();

            if (ONLY_PRESENT && attendanceText !== "出席") {
              return null;
            }

            var editButton = cells[7] ? cells[7].querySelector("button.edit") : null;
            var onclick = editButton ? editButton.getAttribute("onclick") || "" : "";
            var editPath = parseEditPath(onclick);

            if (!editPath) {
              return null;
            }

            return {
              date: dateText,
              childName: childName,
              attendance: attendanceText,
              editPath: editPath
            };
          })
          .filter(function(item) { return item !== null; });

        console.log(
          "[HUG WM] 個人記録 出席レコード数:",
          editTargets.length,
          "/ 行数:",
          rows.length
        );

        var records = [];
        var permissionErrors = [];

        for (var i = 0; i < editTargets.length; i++) {
          var item = editTargets[i];
          try {
            var note = await fetchContactBookNote(item.editPath);
            records.push({
              date: item.date,
              childName: item.childName,
              attendance: item.attendance,
              editPath: item.editPath,
              note: note
            });
            console.log("[HUG WM] 活動内容 note取得成功:", {
              date: item.date,
              childName: item.childName,
              noteLength: note.length
            });
          } catch (noteErr) {
            var noteError = noteErr && noteErr.message ? String(noteErr.message) : String(noteErr);
            
            var isPermissionError = 
              noteError.includes('編集権限') ||
              noteError.includes('権限がありません') ||
              noteError.includes('編集権限がない');

            var record = {
              date: item.date,
              childName: item.childName,
              attendance: item.attendance,
              editPath: item.editPath,
              note: null,
              noteError: noteError
            };

            if (isPermissionError) {
              record.permissionError = true;
              permissionErrors.push({
                date: item.date,
                message: noteError
              });
            }

            records.push(record);
            console.warn("[HUG WM] note取得エラー:", item.date, noteError);
          }
        }

        var result = {
          ok: true,
          listUrl: listUrl,
          records: records,
          rowCount: rows.length,
          presentCount: editTargets.length
        };

        if (permissionErrors.length > 0) {
          result.permissionErrors = permissionErrors;
          console.warn("[HUG WM] 権限エラーが発生しました:", permissionErrors);
        }

        console.log("[HUG WM] 取得完了", {
          totalRecords: records.length,
          permissionErrors: permissionErrors.length
        });

        return result;
      } catch (error) {
        console.error("[HUG WM] 個人記録取得エラー:", error);
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