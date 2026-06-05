const HUG_WM_CHILD_AGREEMENT_FILTER_URL =
  "https://www.hug-ayumu.link/hug/wm/ajax/ajax_child_agreement_filter.php";

/** テスト用フォールバック（contact_book.php 以外から実行時） */
const DEFAULT_FACILITY_IDS = ["3"];
const DEFAULT_TARGET_DATE = "2026-06-05";

/**
 * POST パラメータを組み立てる
 * - f_ary[3]=3 形式（施設 ID ごと）
 * - furigana, parent_flg, target_date
 */
function buildPostParams() {
  const params = new URLSearchParams();
  const urlParams = new URLSearchParams(location.search);

  const facilityIds = collectFacilityIds(urlParams);
  for (const id of facilityIds) {
    params.set(`f_ary[${id}]`, id);
  }

  params.set("furigana", "0");
  params.set("parent_flg", "false");

  const targetDate = resolveTargetDate(urlParams);
  params.set("target_date", targetDate);

  return params;
}

/** 画面上の f_ary チェックボックス → URL の f_id → フォールバック */
function collectFacilityIds(urlParams) {
  const fromCheckboxes = [
    ...document.querySelectorAll('input[type="checkbox"][name^="f_ary"]:checked'),
  ]
    .map((cb) => {
      const match = String(cb.name || "").match(/f_ary\[(\d+)\]/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  if (fromCheckboxes.length > 0) {
    return [...new Set(fromCheckboxes)];
  }

  const fId = urlParams.get("f_id");
  if (fId) {
    return [fId];
  }

  return DEFAULT_FACILITY_IDS;
}

/** 画面上の日付入力 → URL の date → フォールバック */
function resolveTargetDate(urlParams) {
  const dateInput =
    document.querySelector('input[name="date"]') ||
    document.querySelector('input[name="target_date"]') ||
    document.querySelector("#date");

  const inputValue = dateInput?.value?.trim();
  if (inputValue) {
    return inputValue;
  }

  const urlDate = urlParams.get("date") || urlParams.get("target_date");
  if (urlDate) {
    return urlDate;
  }

  return DEFAULT_TARGET_DATE;
}

function parseChildrenFromResponse(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed);
      console.log("[HUG WM] ajax_child_agreement_filter の応答:JSON", data);//childrenとparentがある
      const childrenList = Array.isArray(data)
        ? data
        : data.children || data.child_list || data.list || [];

      const parentList = Array.isArray(data)
        ? data
        : data.parent || data.parent_list || data.parent_list || [];

      console.log("[HUG WM] ajax_child_agreement_filter の応答:parent", parentList);

      return childrenList
        .map((item) => ({
          child_id: Number(item.child_id ?? item.id ?? item.c_id ?? item.value),
          name: String(item.name ?? item.child_name ?? item.text ?? "").trim(),
        }))
        .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);
    } catch {
      // HTML として続行
    }
  }

  const parseOptions = (doc) =>
    [...doc.querySelectorAll("option")]
      .map((opt) => ({
        child_id: Number(opt.value),
        name: opt.textContent.trim(),
      }))
      .filter((c) => Number.isFinite(c.child_id) && c.child_id > 0);

  const htmlDoc = new DOMParser().parseFromString(trimmed, "text/html");
  const fromHtml = parseOptions(htmlDoc);
  if (fromHtml.length > 0) {
    return fromHtml;
  }

  const wrappedDoc = new DOMParser().parseFromString(
    `<select>${trimmed}</select>`,
    "text/html",
  );
  return parseOptions(wrappedDoc);
}

async function fetchChildrenByAjax() {
  const body = buildPostParams();

  console.log("[HUG WM] POST URL:", HUG_WM_CHILD_AGREEMENT_FILTER_URL);
  console.log("[HUG WM] POST payload:", Object.fromEntries(body));

  const response = await fetch(HUG_WM_CHILD_AGREEMENT_FILTER_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });

  const text = await response.text();
  console.log("[HUG WM] ajax_child_agreement_filter の応答:", text);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}\n${text.slice(0, 300)}`);
  }

  const children = parseChildrenFromResponse(text);

  return {
    payload: Object.fromEntries(body),
    rawLength: text.length,
    children,
  };
}

function run() {
  (async () => {
    try {
      console.log("[HUG WM] ajax_child_agreement_filter による児童一覧取得開始");
      const result = await fetchChildrenByAjax();
      console.log("[HUG WM] POST payload:", result.payload);
      console.log("[HUG WM] 応答サイズ:", result.rawLength, "bytes");
      console.log("[HUG WM] 児童数:", result.children.length);
      console.log("[HUG WM] 児童一覧:", result.children);
    } catch (error) {
      console.error("[HUG WM] 児童一覧取得エラー:", error);
    }
  })();
}

if (document.readyState === "loading") {
  window.addEventListener("load", run);
} else {
  run();
}
