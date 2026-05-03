(async () => {
  const SELECT_CHILLED = 92;

  const listUrl =
    `https://www.hug-ayumu.link/hug/wm/addition_plan_situation.php?mode=list&c_id=${SELECT_CHILLED}`;

  try {
    console.log("[HUG WM] 一覧HTML fetch開始:", listUrl);

    const listResponse = await fetch(listUrl, {
      method: "GET",
      credentials: "include"
    });

    console.log("[HUG WM] 一覧 status:", listResponse.status);
    console.log("[HUG WM] 一覧 ok:", listResponse.ok);

    if (!listResponse.ok) {
      throw new Error(`一覧HTML取得エラー: ${listResponse.status}`);
    }

    const listHtml = await listResponse.text();
    const parser = new DOMParser();
    const listDoc = parser.parseFromString(listHtml, "text/html");

    const table = listDoc.querySelector("div.individualSituation table.table");

    if (!table) {
      console.warn("[HUG WM] テーブル未存在");
      return;
    }

    const openLabel = [...table.querySelectorAll("i")]
      .find(el => el.textContent.trim() === "公開");

    if (!openLabel) {
      console.warn("[HUG WM] 公開ラベル未存在");
      return;
    }

    const link = openLabel.closest("a");

    if (!link) {
      console.warn("[HUG WM] 公開リンク未存在");
      return;
    }

    const href = link.getAttribute("href");

    const detailUrlObj = new URL(
      href,
      "https://www.hug-ayumu.link/hug/wm/"
    );

    const SELECT_ID = detailUrlObj.searchParams.get("id");

    if (!SELECT_ID) {
      console.warn("[HUG WM] id取得失敗");
      return;
    }

    console.log("[HUG WM] 取得したSELECT_ID:", SELECT_ID);

    const detailUrl =
      `https://www.hug-ayumu.link/hug/wm/addition_plan.php?mode=detail&id=${SELECT_ID}`;

    console.log("[HUG WM] 詳細HTML fetch開始:", detailUrl);

    const detailResponse = await fetch(detailUrl, {
      method: "GET",
      credentials: "include"
    });

    console.log("[HUG WM] 詳細 status:", detailResponse.status);
    console.log("[HUG WM] 詳細 ok:", detailResponse.ok);

    if (!detailResponse.ok) {
      throw new Error(`詳細HTML取得エラー: ${detailResponse.status}`);
    }

    const detailHtml = await detailResponse.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    // id="carebreak" を抽出
    const carebreak = detailDoc.querySelector("#carebreak");

    if (!carebreak) {
      console.warn("[HUG WM] #carebreak 未存在");
      return;
    }

    console.log("[HUG WM] #carebreak 要素:");
    console.log(carebreak);

    console.log("[HUG WM] #carebreak HTML:");
    console.log(carebreak.outerHTML);

    console.log("[HUG WM] #carebreak テキスト:");
    console.log(carebreak.textContent.trim());

  } catch (error) {
    console.error("[HUG WM] エラー:", error);
  }
})();