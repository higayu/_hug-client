import { initTabs } from "./ui.js";
import { fetchLeftTable } from "./leftWebview.js";
import { fetchRightTable } from "./rightWebview.js";
import { getYearMonthFromDate, getDaysInMonth } from "./getDays.js";

/* =========================
   ★ 取得結果を保持する変数
========================= */
let leftData = [];        // 左：月分の全日データ
let rightDataHtml = "";  // 右：HTMLそのまま

/* =========================
   ★ 初期化
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initTabs();

  const params = new URLSearchParams(location.search);

  facilityIdInput.value   = params.get("FACILITY_ID") ?? "";
  facilityNameInput.value = params.get("FACILITY_NAME") ?? "";
  facilityUrlInput.value  = params.get("FACILITY_URL") ?? "";
  dateStrInput.value      = params.get("DATE_STR") ?? "";

  const url2 = params.get("URL2");
  const right = document.getElementById("right");
  if (right && url2) {
    right.src = url2;
  }
});

/* =========================
   ★ 取得ボタン
========================= */
getDataBtn.onclick = async () => {
  const left  = document.getElementById("left");
  const right = document.getElementById("right");

  const facilityId = facilityIdInput.value;
  const dateStr    = dateStrInput.value;
  const monthStr   = yearMonthInput.value;

  /* ===== データ取得 ===== */
  leftData       = await fetchLeftTable(left, facilityId, dateStr);
  rightDataHtml  = await fetchRightTable(right, facilityId, dateStr);

  /* ===== 表示枠生成 ===== */
  resultView.innerHTML = `
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <select id="dateSelect" style=" font-size: larger;" ></select>
        <div id="leftResult" style="margin-top:10px;"></div>
      </div>
      <div style="flex:1;">
        ${rightDataHtml}
      </div>
    </div>
  `;

  initDateSelector();
  tabResult.click();
};

/* =========================
   ★ 日付セレクタ初期化
========================= */
function initDateSelector() {
  const select = document.getElementById("dateSelect");
  select.innerHTML = "";

  leftData.forEach(day => {
    const option = document.createElement("option");
    option.value = day.date;
    option.textContent = `${day.date}（${day.weekday}）`;
    select.appendChild(option);
  });

  select.onchange = () => {
    renderLeftByDate(select.value);
  };

  // 初期表示（最初の日）
  if (leftData.length > 0) {
    select.value = leftData[0].date;
    renderLeftByDate(leftData[0].date);
  }
}

/* =========================
   ★ 日付指定で左を描画
========================= */
function renderLeftByDate(date) {
  const day = leftData.find(d => d.date === date);
  if (!day) {
    document.getElementById("leftResult").innerHTML = "";
    return;
  }

  const rows = Object.entries(day.categories).map(
    ([category, data]) => `
      <tr>
        <td>${category}</td>
        <td style="text-align:right;">${data.count}</td>
        <td>${data.names.join("<br>")}</td>
      </tr>
    `
  ).join("");

  document.getElementById("leftResult").innerHTML = `
    <h3>${day.date}（${day.weekday}）</h3>
    <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse; width:100%;">
      <thead>
        <tr>
          <th>区分</th>
          <th>人数</th>
          <th>氏名</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="3">データなし</td></tr>`}
      </tbody>
    </table>
  `;
}
