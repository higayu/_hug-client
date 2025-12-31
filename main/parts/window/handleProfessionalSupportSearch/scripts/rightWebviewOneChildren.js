// main\parts\window\handleProfessionalSupportSearch\scripts\rightWebviewOneChildren.js


import { getYearMonthFromDate, getDaysInMonth } from "./getDays.js";

export async function fetchRightTable(right,childrenId, facilityId, monthStr) {
  const startdate =  monthStr+'-01';
  const enddate = monthStr+'-' + getDaysInMonth(monthStr);


  const url =
    `https://www.hug-ayumu.link/hug/wm/record_proceedings.php?f_id=${facilityId}`;

  /* =========================
     ★ 初回ロード
  ========================= */
  await new Promise(resolve => {
    right.addEventListener("did-stop-loading", resolve, { once: true });
    right.src = url;
  });

  /* =========================
     ★ 検索条件セット＋submit
  ========================= */
  await new Promise(async resolve => {
    await right.executeJavaScript(`
      document.querySelectorAll('input[type="checkbox"][name^="f_ary"]')
        .forEach(c => c.checked = false);

      const cb = document.querySelector('input[data-fid="${facilityId}"]');
      if (cb) cb.checked = true;

      const sel = document.querySelector('select[name="adding_children_id"]');
      if (sel) sel.value = "${childrenId}";

      const dp1 = document.getElementById("dp1");
      const dp2 = document.getElementById("dp2");
      if (dp1) dp1.value = "${startdate}";
      if (dp2) dp2.value = "${enddate}";

      document.querySelector('button.btn.search[type="submit"]')?.click();
    `);

    // ★ submit 後のロード完了を待つ
    right.addEventListener("did-stop-loading", resolve, { once: true });
  });

  /* =========================
     ★ table → データ化
  ========================= */
  return right.executeJavaScript(`
(() => {
  const table = document.querySelector("table");
  if (!table) return [];

  const headers = Array.from(
    table.querySelectorAll("thead th")
  ).map(th => th.textContent.trim());

  const rows = [];

  table.querySelectorAll("tbody tr").forEach(tr => {
    const cells = Array.from(tr.children).map(td =>
      td.textContent.replace(/\\s+/g, " ").trim()
    );

    if (cells.length === 0 || cells.every(v => v === "")) return;

    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = cells[i] ?? "";
    });

    rows.push(rowObj);
  });

  return rows;
})();
  `);
}
