/**
 * 全児童取得テスト（#name_list のサーバー埋め込み＝施設契約の全件）
 * パラメータ絞り込みは content.js を使用
 */
const HUG_WM_CONTACT_BOOK_URL = "https://www.hug-ayumu.link/hug/wm/profile_children.php?mode=profile";

function buildListUrl() {
  const url = new URL(HUG_WM_CONTACT_BOOK_URL);
  url.searchParams.set("mode", "profile");
  url.searchParams.set("id", "99");
  return url.href;
}

async function fetchAllChildrenFromNameList() {
  const listUrl = buildListUrl();
  console.log("[HUG WM] 性別年齢取得 fetch開始:", listUrl);

  const response = await fetch(listUrl, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const doc = new DOMParser().parseFromString(await response.text(), "text/html");
  const profileChildren = doc.querySelector("#profileChildren > div.ebox");

  if (!profileChildren) {
    throw new Error("#name_list が見つかりません");
  }

  return profileChildren;
}

function getChildInfo(profileChildren) {
  const labelMap = {
    "児童名": "name",
    "性別": "gender",
    "生年月日": "birthDateText",
    "受給者証番号": "recipientNumber",
    "相談支援事業所": "office",
    "相談支援専門員": "supportStaff",
    "学校": "school",
    "指導": "guidance",
    "担任名": "teacher",
    "アレルギー": "allergy",
    "症状": "symptoms",
    "得意なこと・好きなこと": "goodThings",
    "気をつけてほしいこと": "cautions",
  };

  const info = {};

  const rows = profileChildren.querySelectorAll("table tbody tr");

  rows.forEach((row) => {
    const th = row.querySelector("th")?.textContent.trim();
    const td = row.querySelector("td");

    if (!th || !td) return;

    const key = labelMap[th];
    if (!key) return;

    info[key] = td.innerText.trim();
  });

  const birthDateText = info.birthDateText || "";

  const ageMatch = birthDateText.match(/\((\d+歳)\)/);
  info.age = ageMatch ? ageMatch[1] : "";

  const gradeMatch = birthDateText.match(/\(([^()]*年生)\)/);
  info.grade = gradeMatch ? gradeMatch[1] : "";

  return info;
}


function run() {
  (async () => {
    try {
      const children = await fetchAllChildrenFromNameList();
      console.log("[HUG WM] テーブルデータ取得:", children);
      const info = getChildInfo(children);

      console.log("[HUG WM] info:", info);
      console.log("[HUG WM] 性別:", info.gender);
      console.log("[HUG WM] 年齢:", info.age);
    } catch (error) {
      console.error("[HUG WM] 性別年齢取得エラー:", error);
    }
  })();
}

if (document.readyState === "loading") {
  window.addEventListener("load", run);
} else {
  run();
}
