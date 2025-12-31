export async function fetchRightTable(right, facilityId, dateStr) {

  /* =========================
     ★ 検索条件セット
  ========================= */
  await right.executeJavaScript(`
    document.querySelectorAll('input[type="checkbox"][name^="f_ary"]').forEach(c => c.checked = false);
    const cb = document.querySelector('input[data-fid="${facilityId}"]');
    if (cb) cb.checked = true;

    const sel = document.querySelector('select[name="adding_children_id"]');
    if (sel) sel.value = "55";

    const dp1 = document.getElementById("dp1");
    const dp2 = document.getElementById("dp2");
    if (dp1) dp1.value = "${dateStr}";
    if (dp2) dp2.value = "${dateStr}";

    document.querySelector('button.btn.search[type="submit"]')?.click();
  `);

  /* =========================
     ★ table待機
  ========================= */
  const start = Date.now();
  while (Date.now() - start < 15000) {
    const ok = await right.executeJavaScript(
      `!!document.querySelector("table")`
    );
    if (ok) break;
    await new Promise(r => setTimeout(r, 500));
  }

  /* =========================
     ★ table → 行×列データに変換
  ========================= */
  return right.executeJavaScript(`
(() => {
  const table = document.querySelector("table");
  if (!table) return [];

  /* ===== ヘッダ取得（詳細・コピー除外済み前提） ===== */
  const headers = Array.from(
    table.querySelectorAll("thead th")
  ).map(th => th.textContent.trim());

  const rows = [];

  table.querySelectorAll("tbody tr").forEach(tr => {
    const cells = Array.from(tr.children).map(td =>
      td.textContent.replace(/\\s+/g, " ").trim()
    );

    // 空行は除外
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
