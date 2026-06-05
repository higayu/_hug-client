import { initTabs } from "./ui.js";
import { fetchLeftTable } from "./leftWebview.js";
import { fetchRightTable } from "./rightWebview.js";

/* =========================
   ★ 取得結果を保持する変数
========================= */
let leftDataHtml = "";
let rightDataHtml = "";


document.addEventListener("DOMContentLoaded", () => {
  initTabs();

  const params = new URLSearchParams(location.search);

  const facilityIdInput = document.getElementById("facilityIdInput");
  const facilityNameInput = document.getElementById("facilityNameInput");
  const facilityUrlInput = document.getElementById("facilityUrlInput");
  const dateStrInput = document.getElementById("dateStrInput");
  const right = document.getElementById("right");

  facilityIdInput.value = params.get("FACILITY_ID") ?? "";
  facilityNameInput.value = params.get("FACILITY_NAME") ?? "";
  facilityUrlInput.value = params.get("FACILITY_URL") ?? "";
  dateStrInput.value = params.get("DATE_STR") ?? "";

  const url2 = params.get("URL2");
  if (right && url2) {
    right.src = url2;
  }
});

getDataBtn.onclick = async () => {
  const left = document.getElementById("left");
  const right = document.getElementById("right");

  const facilityId = facilityIdInput.value;
  const dateStr = dateStrInput.value;

  /* =========================
     ★ データ取得 → 変数に保存
  ========================= */
  leftDataHtml = await fetchLeftTable(left, facilityId, dateStr);
  rightDataHtml = await fetchRightTable(right, facilityId, dateStr);

  /* =========================
     ★ 表示（保存した変数を使用）
  ========================= */
  resultView.innerHTML = `
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <h2>📘 左</h2>
        ${leftDataHtml}
      </div>
      <div style="flex:1;">
        <h2>📙 右</h2>
        ${rightDataHtml}
      </div>
    </div>
  `;

  tabResult.click();
};
