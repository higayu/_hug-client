(() => {
  const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

  const FACILITIES = [
    { id: 3, name: "PD吉島" },
    { id: 6, name: "PD光" },
    { id: 7, name: "PD横川" },
    { id: 8, name: "PD五日市駅前" }
  ];

  const normalizeListDate = (text) => {
    const s = String(text || "")
      .trim()
      .replace(/\s+/g, "");
    const m = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!m) return "";
    const y = m[1];
    const mo = String(m[2]).padStart(2, "0");
    const d = String(m[3]).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  };

  const normalizeAttendance = (text) =>
    String(text || "")
      .trim()
      .replace(/\s+/g, " ");

  const extractEditPathFromOnclick = (onclick) => {
    if (!onclick) return "";

    const m = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    return m?.[1] || "";
  };

  const parsePersonalRecordRows = (listDoc) => {
    const table = listDoc.querySelector(
      'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
    );

    if (!table) {
      throw new Error("対象テーブルが見つかりませんでした");
    }

    return [...table.querySelectorAll("tbody tr")]
      .map((row) => {
        const cells = row.querySelectorAll("td");

        const dateText = cells[0]?.textContent.trim() ?? "";
        const dateNorm = normalizeListDate(dateText);
        const childName = (cells[1]?.textContent ?? "")
          .trim()
          .replace(/\s+/g, " ");
        const attendanceText = normalizeAttendance(cells[4]?.textContent);

        const editButton = row.querySelector("button.edit");
        const onclick = editButton?.getAttribute("onclick") ?? "";
        const editPath = extractEditPathFromOnclick(onclick);

        if (!editPath) {
          return null;
        }

        return {
          date: dateText,
          dateNorm,
          childName,
          attendance: attendanceText,
          onclick,
          editPath
        };
      })
      .filter(Boolean);
  };

  const findRecordForDate = (rows, targetDate) => {
    const target = normalizeListDate(targetDate);
    if (!target) {
      return null;
    }

    let fallback = null;

    for (const row of rows) {
      if (row.dateNorm !== target) {
        continue;
      }

      if (row.attendance === "出席") {
        return row;
      }

      if (!fallback) {
        fallback = row;
      }
    }

    return fallback;
  };

  const fetchPersonalRecordList = async ({
    facilityId,
    date,
    dateEnd,
    childId
  }) => {
    const listUrl = new URL("contact_book.php", HUG_WM_BASE_URL);
    listUrl.searchParams.set("f_id", String(facilityId));
    listUrl.searchParams.set("date", date);
    listUrl.searchParams.set("date_end", dateEnd || date);
    listUrl.searchParams.set("id", String(childId));

    console.log("[HUG WM] 一覧HTML fetch開始:", listUrl.href);

    const listResponse = await fetch(listUrl.href, {
      method: "GET",
      credentials: "include"
    });

    if (!listResponse.ok) {
      throw new Error(`一覧HTML取得エラー: ${listResponse.status}`);
    }

    const listHtml = await listResponse.text();
    const parser = new DOMParser();
    const listDoc = parser.parseFromString(listHtml, "text/html");

    const rows = parsePersonalRecordRows(listDoc);
    console.log("[HUG WM] 一覧行数:", rows.length, rows);

    return rows;
  };

  const fetchPersonalRecords = async ({
    facilityId,
    date,
    dateEnd,
    childId,
    withNotes = true
  }) => {
    const rows = await fetchPersonalRecordList({
      facilityId,
      date,
      dateEnd,
      childId
    });

    const targetDate = dateEnd || date;
    const row = findRecordForDate(rows, targetDate);

    if (!row) {
      throw new Error(
        `日付=${targetDate} の編集行が見つかりません（一覧 ${rows.length} 行。出席・編集ボタンを確認してください）`
      );
    }

    if (!withNotes) {
      return [row];
    }

    const fetchEditData = window.HugEditPage?.fetchContactBookEditData;
    if (!fetchEditData) {
      throw new Error("HugEditPage が読み込まれていません（editpage.js）");
    }

    console.log("[HUG WM] 編集ページ取得:", row.editPath);

    const { note, recordStaff, editHtml, editPath } = await fetchEditData(
      row.editPath
    );

    const result = { ...row, note, recordStaff, editHtml, editPath };
    console.log("[HUG WM] 取得完了:", result);

    return [result];
  };

  window.HugPersonalList = {
    FACILITIES,
    normalizeListDate,
    fetchPersonalRecordList,
    fetchPersonalRecords
  };
})();
