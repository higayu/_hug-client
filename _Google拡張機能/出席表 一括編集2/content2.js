// ページ読み込み完了後に実行
window.addEventListener("load", () => {

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") !== "all_edit") return;

  const table = document.querySelector(
    "table.table.tablesorter.sortTableAdding.responsive.pick.adeletetable.js_adding_table"
  );

  if (!table) return;

  const headerRow = table.querySelector("thead tr");
  const headers = headerRow.querySelectorAll("th");

  let kasanTh = null;
  headers.forEach(th => {
    if (th.innerText.trim() === "加算記録") kasanTh = th;
  });
  if (!kasanTh) return;

  /* =========================
     ヘッダー列追加
  ========================= */
  if (!table.querySelector("th.kasan-copy")) {
    const newTh = document.createElement("th");
    newTh.innerText = "加算記録（確認）";
    newTh.classList.add("kasan-copy");
    kasanTh.after(newTh);
  }

  /* =========================
     tbody 単位で処理
  ========================= */
  const tbodies = table.querySelectorAll("tbody");

  tbodies.forEach((tbody, tbodyIndex) => {

    const tr = tbody.querySelector("tr");
    if (!tr) return;

    const rowData = {
      c_id: tbody.querySelector(".js_cid")?.value || null,
      f_id: tbody.querySelector(".js_f_service")?.value || null
    };

    if (!rowData.c_id) return;

    /* =========================
       加算記録セル特定
    ========================= */
    const cells = tr.querySelectorAll("td");
    const headerIndex = Array.from(headerRow.children).indexOf(kasanTh);
    const kasanTd = cells[headerIndex];
    if (!kasanTd) return;

    // すでに追加済みならスキップ
    if (kasanTd.nextElementSibling?.classList.contains("kasan-copy")) return;

    /* =========================
       新しい td 作成
    ========================= */
    const newTd = document.createElement("td");
    newTd.classList.add("kasan-copy");
    newTd.style.background = "#fffbe6";

    /* =========================
       ボタン作成
    ========================= */
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "確認";
    btn.className = "btn btn-sm";

    btn.addEventListener("click", () => {
      const url =
        "https://www.hug-ayumu.link/hug/wm/record_proceedings.php" +
        `?mode=edit&select_child=${rowData.c_id}`;

      console.log("遷移URL:", url);
      window.location.href = url;
    });

    newTd.appendChild(btn);

    /* =========================
       右に挿入
    ========================= */
    kasanTd.after(newTd);
  });

});
