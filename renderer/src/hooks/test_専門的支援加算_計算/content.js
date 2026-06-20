(() => {
  const RECORD_PROCEEDINGS_URL =
    "https://www.hug-ayumu.link/hug/wm/record_proceedings.php";

  /** リクエスト固定値 */
  const FIXED_C_ID = "92";//児童id
  const FIXED_INTERVIEW_DATE = "2026年06月01日";//月初め
  const FIXED_INTERVIEW_DATE_END = "2026年06月20日";//指定日
  const FIXED_F_ID = "3";//施設id
  const ADDING_CHILDREN_ID = "55";//専門的支援加算id

  const TABLE_SELECTOR =
    "div.contents div.ibox div.mb40 table.table";

  const normalizeText = (el) =>
    (el?.textContent ?? "").replace(/\s+/g, " ").trim();

  const extractRecordId = (onclick) => {
    const match = String(onclick || "").match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
  };

  const getCsrfToken = (doc) =>
    doc.querySelector('[name="csrf_token_from_client"]')?.value?.trim() || "";

  const fetchSearchFormDoc = async () => {
    const response = await fetch(RECORD_PROCEEDINGS_URL, {
      method: "GET",
      credentials: "include"
    });

    const html = await response.text();

    if (!response.ok) {
      throw new Error(`検索フォーム取得 HTTP error: ${response.status}`);
    }

    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc.querySelector("#form_id") && !getCsrfToken(doc)) {
      throw new Error(
        "検索フォームが取得できません。HUGへのログイン状態を確認してください"
      );
    }

    return doc;
  };

  const buildSearchParams = (doc) => {
    const csrf = getCsrfToken(doc);

    if (!csrf) {
      throw new Error("csrf_token_from_client が取得できません");
    }

    const params = new URLSearchParams();

    params.set("mode", "search");
    params.set("mode_token", "nomode");
    params.set("csrf_token_from_client", csrf);

    params.set("f_ary[3]", "3");
    params.set("c_id", FIXED_C_ID);

    params.append("search", "");

    params.set("interview_date", FIXED_INTERVIEW_DATE);
    params.set("interview_date_end", FIXED_INTERVIEW_DATE_END);

    params.set("s_ary[1]", "放課後等デイサービス");
    params.set("s_ary[2]", "児童発達支援");

    params.set("adding_children_id", ADDING_CHILDREN_ID);
    params.set("recorder", "");

    return params;
  };

  const parseResultTable = (doc) => {
    const table = doc.querySelector(TABLE_SELECTOR);

    if (!table) {
      return { table: null, headers: [], rows: [] };
    }

    const headers = [...table.querySelectorAll("thead th")].map((th) =>
      normalizeText(th)
    );

    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => {
      const cells = [...tr.querySelectorAll("td")];

      const detailOnclick =
        cells[0]?.querySelector("[onclick]")?.getAttribute("onclick") || "";

      return {
        recordId: extractRecordId(detailOnclick),
        児童名: normalizeText(cells[1]),
        加算名: normalizeText(cells[2]),
        施設名: normalizeText(cells[3]),
        利用サービス: normalizeText(cells[4]),
        記録者: normalizeText(cells[5]),
        実施日: normalizeText(cells[6]),
        ステータス:
          cells[7]?.querySelector(".label")?.textContent?.trim() ||
          normalizeText(cells[7]),
        サイン済: normalizeText(cells[8]),
        最終更新: normalizeText(cells[9])
      };
    });

    return { table, headers, rows };
  };

  const searchSavedRecords = async () => {
    const formDoc = await fetchSearchFormDoc();
    const body = buildSearchParams(formDoc);

    console.log("[HUG WM] POST検索 URL:", RECORD_PROCEEDINGS_URL);
    console.log("[HUG WM] POST payload:", Object.fromEntries(body));

    const response = await fetch(RECORD_PROCEEDINGS_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString()
    });

    const html = await response.text();

    if (!response.ok) {
      throw new Error(`検索POST HTTP error: ${response.status}`);
    }

    const resultDoc = new DOMParser().parseFromString(html, "text/html");
    const { table, headers, rows } = parseResultTable(resultDoc);

    return {
      cId: FIXED_C_ID,
      interviewDate: FIXED_INTERVIEW_DATE,
      interviewDateEnd: FIXED_INTERVIEW_DATE_END,
      requestMethod: "POST",
      table,
      headers,
      rows,
      rowCount: rows.length,
      responseHtml: html
    };
  };

  window.HugRecordProceedingsSearchTest = {
    RECORD_PROCEEDINGS_URL,
    FIXED_C_ID,
    FIXED_INTERVIEW_DATE,
    FIXED_INTERVIEW_DATE_END,
    FIXED_F_ID,
    ADDING_CHILDREN_ID,
    searchSavedRecords,
    parseResultTable
  };

  (async () => {
    try {
      console.log("[HUG WM] 専門的支援 保存済み確認（POST検索テスト）");
      console.log("[HUG WM] リクエスト方式: POST");
      console.log("[HUG WM] 固定 c_id:", FIXED_C_ID);
      console.log(
        "[HUG WM] 固定 実施日:",
        FIXED_INTERVIEW_DATE,
        "〜",
        FIXED_INTERVIEW_DATE_END
      );

      const result = await searchSavedRecords();

      if (!result.table) {
        console.warn("[HUG WM] 結果テーブルが見つかりません");
        console.log(
          "[HUG WM] レスポンス先頭:",
          result.responseHtml.slice(0, 500)
        );
        return;
      }

      console.log("[HUG WM] テーブル列:", result.headers);
      console.log("[HUG WM] 取得件数:", result.rowCount);

      if (result.rowCount > 0) {
        console.log("[HUG WM] 保存済み確認: 保存済み");
      } else {
        console.log("[HUG WM] 保存済み確認: 保存なし");
      }

      console.table(result.rows);

      result.rows.forEach((row, index) => {
        console.log(`[HUG WM] [${index + 1}]`, row);
      });
    } catch (error) {
      console.error("[HUG WM] 保存済み確認エラー:", error);
    }
  })();
})();