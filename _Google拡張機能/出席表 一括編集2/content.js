window.addEventListener("load", () => {

  console.log("=== kasan-copy script start ===");

  /* =========================================
     【2】一覧画面用テーブル（sortTable01）
  ========================================= */
  const listTable = document.querySelector(
    "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
  );

  if (!listTable) {
    console.log("【2】listTable なし");
  } else {
    console.log("【2】listTable 取得OK");

    const theadRow = listTable.querySelector("thead tr");
    if (theadRow && !theadRow.querySelector("th.kasan-copy")) {
      const th = document.createElement("th");
      th.textContent = "加算記録";
      th.classList.add("kasan-copy");
      theadRow.appendChild(th);
    }

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

  /* =========================================
    【1】all_edit 用テーブル（Adding系）
  ========================================= */

  console.log("【1-START】Adding系処理 開始");

  const addingTable = document.querySelector(
    "table.table.tablesorter.sortTableAdding.responsive.pick.adeletetable.js_adding_table"
  );

  if (!addingTable) {
    console.log("【1-1】addingTable なし（all_edit以外）");
  } else {
    console.log("【1-1】addingTable 取得OK", addingTable);

    const headerRow = addingTable.querySelector("thead tr");
    if (!headerRow) {
      console.warn("【1-2】thead tr が見つからない");
    } else {
      console.log("【1-2】thead tr 取得OK", headerRow);

      const headers = headerRow.querySelectorAll("th");
      console.log("【1-3】th 数 =", headers.length);

      headers.forEach((th, i) => {
        console.log(`【1-3-${i}】th[${i}] text=`, th.innerText.trim());
      });

      if (!headers.length) {
        console.warn("【1-4】th が存在しない");
      } else {

        // ★ 常に最右列を基準にする
        const kasanTh = headers[headers.length - 1];
        console.log(
          "【1-5】kasanTh（最右列） index =",
          headers.length - 1,
          "text =",
          kasanTh.innerText.trim()
        );

        // ヘッダー追加
        if (!addingTable.querySelector("th.kasan-copy")) {
          console.log("【1-6】kasan-copy ヘッダー未存在 → 追加");

          const newTh = document.createElement("th");
          newTh.innerText = "加算記録";
          newTh.classList.add("kasan-copy");
          kasanTh.after(newTh);

        } else {
          console.log("【1-6】kasan-copy ヘッダー既に存在");
        }

        // 行処理
        addingTable.querySelectorAll("tbody").forEach((tbody, tbodyIndex) => {

          const tr = tbody.querySelector("tr");
          if (!tr) return;

          /* =========================
            ★ 最初の td から c_id 取得
          ========================= */
          const firstTd = tr.querySelector("td"); // ← 修正点
          if (!firstTd) {
            console.warn(`tbody[${tbodyIndex}] first td なし`);
            return;
          }

          const link = firstTd.querySelector(
            "a[href*='profile_children.php']"
          );
          if (!link) {
            console.warn(`tbody[${tbodyIndex}] profile link なし`);
            return;
          }

          const href = link.getAttribute("href");
          const match = href?.match(/id=(\d+)/);
          if (!match) {
            console.warn(`tbody[${tbodyIndex}] id 抽出失敗`, href);
            return;
          }

          const c_id = match[1];
          console.log(`tbody[${tbodyIndex}] c_id =`, c_id);

          /* =========================
            列追加（最右 td 基準）
          ========================= */
          const cells = tr.querySelectorAll("td");
          const baseTd = cells[cells.length - 1];
          if (!baseTd) return;

          if (baseTd.nextElementSibling?.classList.contains("kasan-copy")) return;

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
          baseTd.after(newTd);
        });


      }
    }
  }

  console.log("【1-END】Adding系処理 終了");
  console.log("=== kasan-copy script end ===");


});
