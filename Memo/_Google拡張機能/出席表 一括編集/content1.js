// ページ読み込み完了後に実行
window.addEventListener("load", () => {

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") !== "all_edit") return;

  const table = document.querySelector(
    "table.table.tablesorter.responsive.pick.adeletetable.js_adding_table"
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

    /* ========= hidden 行データ ========= */
    const rowData = {
      tbodyId: tbody.id,
      c_id: tbody.querySelector(".js_cid")?.value || null,
      f_id: tbody.querySelector(".js_f_service")?.value || null,
      support_required: tbody.querySelector(".support_required_flg")?.value,
      severe_support: tbody.querySelector(".severe_support_flg")?.value,
      need_protection: tbody.querySelector(".need_protection_flg")?.value,
      school_refusal: tbody.querySelector(".school_refusal_support_flg")?.value,
      strength_action: tbody.querySelector(".strength_action_flg")?.value,
      special_support_add: tbody.querySelector(".special_support_add")?.value
    };

    /* ========= 表示データ ========= */
    const name =
      tr.querySelector(".nameBox p")?.innerText.trim() || "";

    const kasanSelect =
      tr.querySelector('select[name*="[selected_content]"]');

    const kasanValue = kasanSelect?.value || "";
    const kasanLabel =
      kasanSelect?.selectedOptions[0]?.innerText || "";

    /* ========= コンソールログ（正しい位置） ========= */
    console.log("【行データ】", {
      index: tbodyIndex,
      name,
      kasanValue,
      kasanLabel,
      ...rowData
    });

    /* =========================
       加算記録（確認）列追加
    ========================= */
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
      console.log("【確認ボタン押下】", {
        name,
        kasanValue,
        kasanLabel,
        ...rowData
      });
    });

    newTd.appendChild(btn);
    kasanTd.after(newTd);
  });

});
