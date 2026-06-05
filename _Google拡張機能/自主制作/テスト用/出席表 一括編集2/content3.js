// ページ読み込み完了後に実行
window.addEventListener("load", () => {

  // sortTable01 のみ取得（Adding系は除外）
  const table = document.querySelector(
    "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
  );

  /* =========================
     テーブル取得確認（1回だけ）
  ========================= */
  if (!table) {
    console.warn("[kasan-copy] 対象テーブル取得失敗");
    return;
  } else {
    console.log("[kasan-copy] 対象テーブル取得OK");
  }

  /* =========================
     ヘッダーに列を追加
  ========================= */
  const theadRow = table.querySelector("thead tr");
  if (theadRow) {
    const th = document.createElement("th");
    th.textContent = "加算記録";
    th.classList.add("kasan-copy");
    theadRow.appendChild(th);
  }

  /* =========================
     行処理
  ========================= */
  table.querySelectorAll("tbody tr").forEach((tr) => {

    const profileLink = tr.querySelector(
      ".realname a[href*='profile_children.php']"
    );
    const match = profileLink?.getAttribute("href")?.match(/id=(\d+)/);
    if (!match) return;

    if (tr.querySelector("td.kasan-copy")) return;

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
});
