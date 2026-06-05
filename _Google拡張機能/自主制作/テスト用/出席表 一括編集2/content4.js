window.addEventListener("load", () => {

  /* =========================================
     共通：URLパラメータ
  ========================================= */
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  /* =========================================
     【1】all_edit 用テーブル（Adding系）
  ========================================= */
  if (mode === "all_edit") {

    const addingTable = document.querySelector(
      "table.table.tablesorter.sortTableAdding.responsive.pick.adeletetable.js_adding_table"
    );

    if (addingTable) {

      const headerRow = addingTable.querySelector("thead tr");
      const headers = headerRow.querySelectorAll("th");

      let kasanTh = null;
      headers.forEach(th => {
        if (th.innerText.trim() === "加算記録") kasanTh = th;
      });
      if (!kasanTh) return;

      // ヘッダー追加
      if (!addingTable.querySelector("th.kasan-copy")) {
        const newTh = document.createElement("th");
        newTh.innerText = "加算記録（確認）";
        newTh.classList.add("kasan-copy");
        kasanTh.after(newTh);
      }

      // tbody 単位で処理
      addingTable.querySelectorAll("tbody").forEach(tbody => {

        const tr = tbody.querySelector("tr");
        if (!tr) return;

        const c_id = tbody.querySelector(".js_cid")?.value;
        if (!c_id) return;

        const cells = tr.querySelectorAll("td");
        const headerIndex = Array.from(headerRow.children).indexOf(kasanTh);
        const kasanTd = cells[headerIndex];
        if (!kasanTd) return;

        if (kasanTd.nextElementSibling?.classList.contains("kasan-copy")) return;

        const newTd = document.createElement("td");
        newTd.classList.add("kasan-copy");
        newTd.style.background = "#fffbe6";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = "確認";
        btn.className = "btn btn-sm";

        btn.addEventListener("click", () => {
          window.location.href =
            "https://www.hug-ayumu.link/hug/wm/record_proceedings.php" +
            `?mode=edit&select_child=${c_id}`;
        });

        newTd.appendChild(btn);
        kasanTd.after(newTd);
      });
    }
  }

  /* =========================================
     【2】一覧画面用テーブル（sortTable01）
  ========================================= */
  const listTable = document.querySelector(
    "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
  );

  if (listTable) {

    // ヘッダー追加
    const theadRow = listTable.querySelector("thead tr");
    if (theadRow && !theadRow.querySelector("th.kasan-copy")) {
      const th = document.createElement("th");
      th.textContent = "加算記録";
      th.classList.add("kasan-copy");
      theadRow.appendChild(th);
    }

    // 行処理
    listTable.querySelectorAll("tbody tr").forEach(tr => {

      if (tr.querySelector("td.kasan-copy")) return;

      const link = tr.querySelector(
        ".realname a[href*='profile_children.php']"
      );
      const match = link?.getAttribute("href")?.match(/id=(\d+)/);
      if (!match) return;

      const c_id = match[1];

      const newTd = document.createElement("td");
      newTd.classList.add("kasan-copy");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "移動";
      btn.className = "btn btn-sm";

      btn.addEventListener("click", () => {
        window.location.href =
          "https://www.hug-ayumu.link/hug/wm/record_proceedings.php" +
          `?mode=edit&select_child=${c_id}`;
      });

      newTd.appendChild(btn);
      tr.appendChild(newTd);
    });
  }

});
