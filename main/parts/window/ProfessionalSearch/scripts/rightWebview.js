export async function fetchRightTable(right, facilityId, dateStr) {
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

  // table待機
  const start = Date.now();
  while (Date.now() - start < 15000) {
    const ok = await right.executeJavaScript(`!!document.querySelector("table")`);
    if (ok) break;
    await new Promise(r => setTimeout(r, 500));
  }

  return right.executeJavaScript(`
    const t = document.querySelector("table");
    t ? t.outerHTML : "<p>右：テーブルなし</p>";
  `);
}
