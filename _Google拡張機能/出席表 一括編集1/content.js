// ページ読み込み完了後に実行
window.addEventListener("load", () => {

  const table = document.querySelector(
    'table[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
  );

  if (!table) return;

  /* =========================
     ヘッダーに列を追加
  ========================= */
  const theadRow = table.querySelector("thead tr");
  if (theadRow) {
    const th = document.createElement("th");
    th.textContent = "専門的支援加算へ";
    theadRow.appendChild(th);
  }

  /* =========================
     各行に列を追加
  ========================= */
  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 8) return;

    // 8列目の td
    const targetTd = cells[7];

    // 編集ボタンを取得
    const editBtn = targetTd.querySelector("button.edit");
    if (!editBtn) return;

    // onclick 属性から c_id を取得
    const onclickText = editBtn.getAttribute("onclick") || "";
    const match = onclickText.match(/c_id=(\d+)/);

    if (!match) return;

    const c_id = match[1];

    /* =========================
       新しい td を作成
    ========================= */
    const newTd = document.createElement("td");

    /* =========================
       ボタン作成
    ========================= */
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "移動";
    btn.className = "btn btn-sm";

    btn.addEventListener("click", () => {
      const url =
        "https://www.hug-ayumu.link/hug/wm/record_proceedings.php" +
        `?mode=edit&select_child=${c_id}`;

      console.log("遷移URL:", url);
      window.location.href = url;
    });

    newTd.appendChild(btn);
    row.appendChild(newTd);
  });

});
