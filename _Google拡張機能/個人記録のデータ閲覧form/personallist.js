(() => {
  const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

  const FACILITIES = [
    { id: 3, name: "PD吉島" },
    { id: 6, name: "PD光" },
    { id: 7, name: "PD横川" },
    { id: 8, name: "PD五日市駅前" }
  ];

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

        const dateText = cells[0]?.textContent.trim();
        const childName = cells[1]?.textContent.trim().replace(/\s+/g, " ");
        const attendanceText = cells[4]?.textContent.trim();

        if (attendanceText !== "出席") {
          return null;
        }

        const editButton = cells[7]?.querySelector("button.edit");
        const onclick = editButton?.getAttribute("onclick");

        if (!onclick) {
          return null;
        }

        const editPath = onclick.match(/location\.href='([^']+)'/)?.[1];

        return {
          date: dateText,
          childName,
          attendance: attendanceText,
          onclick,
          editPath
        };
      })
      .filter(Boolean);
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

    return parsePersonalRecordRows(listDoc);
  };

  const fetchPersonalRecords = async ({
    facilityId,
    date,
    dateEnd,
    childId,
    childName,
    withNotes = true
  }) => {
    const rows = await fetchPersonalRecordList({
      facilityId,
      date,
      dateEnd,
      childId
    });

    const filtered = childName
      ? rows.filter((row) => row.childName === childName)
      : rows;

    if (!withNotes || !window.HugEditPage?.fetchContactBookNote) {
      return filtered;
    }

    const results = [];

    for (const item of filtered) {
      const note = item.editPath
        ? await window.HugEditPage.fetchContactBookNote(item.editPath)
        : null;

      results.push({ ...item, note });
    }

    return results;
  };

  window.HugPersonalList = {
    FACILITIES,
    fetchPersonalRecordList,
    fetchPersonalRecords
  };
})();
