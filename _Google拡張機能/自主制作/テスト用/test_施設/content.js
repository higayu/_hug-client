/**
 * 施設データ取得テスト
 * attendance.php 内の施設選択 select から option を取得
 */
const HUG_WM_ATTENDANCE_URL = "https://www.hug-ayumu.link/hug/wm/attendance.php";

/**
 * 指定された施設 select
 */
const FACILITY_SELECT_SELECTOR =
  "body > div.contents > form > div > div:nth-child(2) > div:nth-child(2) > select";

function buildListUrl() {
  const url = new URL(HUG_WM_ATTENDANCE_URL);
  return url.href;
}

async function fetchFacilitySelect() {
  const listUrl = buildListUrl();
  console.log("[HUG WM] 施設データ取得 fetch開始:", listUrl);

  const response = await fetch(listUrl, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const facilitySelect = doc.querySelector(FACILITY_SELECT_SELECTOR);

  if (!facilitySelect) {
    throw new Error("施設選択 select が見つかりません");
  }

  return facilitySelect;
}

function getFacilityData(facilitySelect) {
  const options = facilitySelect.querySelectorAll("option");

  const facilities = Array.from(options)
    .map((option) => {
      return {
        value: option.value.trim(),
        name: option.textContent.trim(),
        selected: option.selected,
      };
    })
    // 空 option を除外したい場合
    .filter((facility) => facility.value || facility.name);

  return facilities;
}

function run() {
  (async () => {
    try {
      const facilitySelect = await fetchFacilitySelect();

      console.log("[HUG WM] 施設 select:", facilitySelect);

      const facilities = getFacilityData(facilitySelect);

      console.log("[HUG WM] 施設データ:", facilities);
      console.table(facilities);
    } catch (error) {
      console.error("[HUG WM] 施設データ取得エラー:", error);
    }
  })();
}

if (document.readyState === "loading") {
  window.addEventListener("load", run);
} else {
  run();
}