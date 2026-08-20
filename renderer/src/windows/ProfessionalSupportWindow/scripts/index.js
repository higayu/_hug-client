import { initTabs } from "./ui.js";
import { fetchLeftTable } from "./leftWebview.js";
import { fetchRightTable } from "./rightWebview.js";
import { getYearMonthFromDate, getDaysInMonth } from "./getDays.js";

/* =========================
   ★ 取得結果を保持する変数
========================= */
let leftData = [];        // 左：月分の全日データ
let rightData = [];       // 右：日付単位の行データ（配列）

/* =========================
   ★ 初期化
========================= */
export function initializeProfessionalSupportWindow() {
  initTabs();

  const params = new URLSearchParams(location.search);
  const facilityIdInput = document.getElementById("facilityIdInput");
  const facilityNameInput = document.getElementById("facilityNameInput");
  const facilityUrlInput = document.getElementById("facilityUrlInput");
  const dateStrInput = document.getElementById("dateStrInput");
  const yearMonthInput = document.getElementById("yearMonthInput");

  facilityIdInput.value   = params.get("FACILITY_ID") ?? "";
  facilityNameInput.value = params.get("FACILITY_NAME") ?? "";
  facilityUrlInput.value  = params.get("FACILITY_URL") ?? "";
  dateStrInput.value      = params.get("DATE_STR") ?? "";
  yearMonthInput.value = getYearMonthFromDate(dateStrInput.value);

  const url2 = params.get("URL2");
  const right = document.getElementById("right");
  if (right && url2) {
    right.src = url2;
  }

  const getDataButton = document.getElementById("getDataBtn");
  getDataButton.onclick = handleGetData;

  return () => {
    getDataButton.onclick = null;
  };
}

/* =========================
   ★ 取得ボタン
========================= */
async function handleGetData() {
  const left  = document.getElementById("left");
  const facilityIdInput = document.getElementById("facilityIdInput");
  const dateStrInput = document.getElementById("dateStrInput");
  const resultView = document.getElementById("resultView");
  const tabResult = document.getElementById("tabResult");
  const facilityId = facilityIdInput.value;
  const dateStr    = dateStrInput.value;

  /* ===== 左（月データ）取得 ===== */
  leftData = await fetchLeftTable(left, facilityId, dateStr);

  /* ===== 表示枠生成 ===== */
  resultView.innerHTML = `
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <select id="dateSelect" style="font-size:larger;"></select>
        <div id="leftResult" style="margin-top:10px;"></div>
      </div>
      <div style="flex:1;">
        <h1 id="rightTitle"></h1>
        <div id="rightResult"></div>
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
    renderByDate(select.value);
  };

  if (leftData.length > 0) {
    select.value = leftData[0].date;
    renderByDate(leftData[0].date);
  }
}

/* =========================
   ★ 日付指定で左右を描画
========================= */
async function renderByDate(date) {
  renderLeftByDate(date);
  await renderRightByDate(date);
}

/* ---------- 左 ---------- */
function renderLeftByDate(date) {
  const day = leftData.find(d => d.date === date);
  if (!day) {
    document.getElementById("leftResult").innerHTML = "";
    return;
  }

  const rows = Object.entries(day.categories).map(
    ([category, data]) => `
      <tr>
        <td style="width:80px;">${category}</td>
        <td style="width:50px;text-align:right;">${data.count}</td>
        <td>${data.names.join("<br>")}</td>
      </tr>
    `
  ).join("");

  document.getElementById("leftResult").innerHTML = `
    <h3>${day.date}（${day.weekday}）</h3>
    <table border="1" cellspacing="0" cellpadding="4"
           style="border-collapse:collapse; width:100%;">
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

/* ---------- 右 ---------- */
async function renderRightByDate(date) {
  const right = document.getElementById("right");
  const facilityId = document.getElementById("facilityIdInput").value;

  rightData = await fetchRightTable(right, facilityId, date);

  document.getElementById("rightTitle").textContent = date;

  if (!rightData || rightData.length === 0) {
    document.getElementById("rightResult").innerHTML =
      "<p>記録データなし</p>";
    return;
  }

  const headers = Object.keys(rightData[0]);

  const thead = `
    <tr>
      ${headers.map(h => `<th>${h}</th>`).join("")}
    </tr>
  `;

  const tbody = rightData.map(row => `
    <tr>
      ${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}
    </tr>
  `).join("");

  document.getElementById("rightResult").innerHTML = `
    <table border="1" cellspacing="0" cellpadding="4"
           style="border-collapse:collapse; width:100%;">
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
}
