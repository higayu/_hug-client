(() => {
  /** 確認したい児童の c_id（必要に応じて変更） */
  const FIXED_CHILD_ID = "99";

  /** 利用施設 f_id（HTML未選択時の既定。施設に合わせて変更） */
  const DEFAULT_F_ID = "3";

  const ADDING_CHILDREN_ID = "55"; // 専門的支援実施加算
  const RECORD_PROCEEDINGS_URL =
    "https://www.hug-ayumu.link/hug/wm/record_proceedings.php";
  const AJAX_URL =
    "https://www.hug-ayumu.link/hug/wm/ajax/ajax_record_proceedings.php";

  const parseUseDaysNumber = (text) => {
    if (!text) return null;
    const match = String(text).match(/利用日数[：:]\s*(\d+)\s*日/);
    return match ? Number(match[1]) : null;
  };

  const postAjax = async (params, label) => {
    const body = new URLSearchParams(params);

    const response = await fetch(AJAX_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body.toString()
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`${label} HTTP error: ${response.status}`);
    }

    if (!text.trim()) {
      throw new Error(`${label} が空レスポンスです`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `${label} JSON解析失敗: ${text.slice(0, 300)}`
      );
    }
  };

  const parseCountParamsFromChildrenInfo = (html, cId, interview_date, f_id) => {
    if (!html) return null;

    const infoDoc = new DOMParser().parseFromString(
      `<div>${html}</div>`,
      "text/html"
    );
    const s_id = infoDoc.querySelector(".js_c_s_id")?.value || "";

    if (!s_id || !f_id) return null;

    return {
      c_id: String(cId),
      s_id: String(s_id),
      f_id: String(f_id),
      interview_date
    };
  };

  const parseFidFromFacilityDom = (html) => {
    if (!html) return "";

    const facilityDoc = new DOMParser().parseFromString(html, "text/html");
    const selected = facilityDoc.querySelector("option[selected]");
    if (selected?.value) return selected.value;

    return facilityDoc.querySelector("option")?.value || "";
  };

  const fetchCountParamsViaGetData = async (doc, cId) => {
    const interview_date =
      doc.querySelector("[name=interview_date]")?.value?.trim() || "";
    const rp_id = doc.querySelector("[name=id]")?.value || "insert";

    if (!interview_date) {
      throw new Error("面談日がHTMLから取得できません");
    }

    const data = await postAjax(
      {
        mode: "getData",
        rp_id,
        change_type: "children",
        interview_date,
        adding_children_id: ADDING_CHILDREN_ID,
        [`c_id_list[${cId}]`]: cId,
        [`f_id_list[${cId}]`]: DEFAULT_F_ID
      },
      "getData"
    );

    const f_id =
      parseFidFromFacilityDom(data.facility_dom?.[cId]) || DEFAULT_F_ID;

    const fromInfo = parseCountParamsFromChildrenInfo(
      data.children_info?.[cId],
      cId,
      interview_date,
      f_id
    );

    if (fromInfo) return fromInfo;

    if (!data.children_array?.[cId]) {
      throw new Error(
        `児童ID ${cId} は面談日・専門的支援の条件で選択できません`
      );
    }

    throw new Error("getData から s_id を取得できませんでした");
  };

  const fetchUseDays = async (countParams) => {
    const data = await postAjax(
      {
        mode: "getcount",
        c_id: countParams.c_id,
        s_id: countParams.s_id,
        f_id_list: countParams.f_id,
        interview_date: countParams.interview_date
      },
      "getcount"
    );

    const days = parseUseDaysNumber(data.use_days);

    if (days === null) {
      throw new Error(`利用日数の解析に失敗: ${data.use_days}`);
    }

    return { days, label: data.use_days };
  };

  const fetchFormHtml = async (cId = FIXED_CHILD_ID) => {
    const formUrl =
      `${RECORD_PROCEEDINGS_URL}?mode=edit&select_child=${encodeURIComponent(cId)}`;

    const formResponse = await fetch(formUrl, {
      method: "GET",
      credentials: "include"
    });

    const html = await formResponse.text();
    return { formUrl, formResponse, html };
  };

  const fetchSpecialSupportUseDays = async (cId = FIXED_CHILD_ID) => {
    const { formResponse, html } = await fetchFormHtml(cId);

    if (!formResponse.ok) {
      throw new Error(`フォーム取得 HTTP error: ${formResponse.status}`);
    }

    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc.querySelector("#form_id")) {
      throw new Error(
        "登録フォームが取得できません。HUGへのログイン状態を確認してください"
      );
    }

    if (!doc.querySelector(`.js_c_list option[value="${cId}"]`)) {
      throw new Error(`児童ID ${cId} が児童一覧に存在しません`);
    }

    const selectedChild = doc.querySelector(".js_c_list")?.value;
    const fIdOptions = doc.querySelector(".js_c_f_id")?.options?.length ?? 0;

    console.log("[HUG WM] HTML上の児童選択:", selectedChild || "未選択");
    console.log("[HUG WM] HTML上の利用施設 option数:", fIdOptions);

    const countParams = await fetchCountParamsViaGetData(doc, cId);
    const useDays = await fetchUseDays(countParams);

    return {
      cId,
      countParams,
      currentDays: useDays.days,
      nextDay: useDays.days + 1,
      label: useDays.label
    };
  };

  window.HugSpecialSupportUseDays = {
    FIXED_CHILD_ID,
    DEFAULT_F_ID,
    fetchFormHtml,
    fetchSpecialSupportUseDays
  };

  (async () => {
    try {
      const result = await fetchSpecialSupportUseDays();

      console.log("[HUG WM] 専門的支援 利用日数チェック");
      console.log("[HUG WM] 児童ID:", result.cId);
      console.log("[HUG WM] 面談日:", result.countParams.interview_date);
      console.log(
        "[HUG WM] s_id / f_id:",
        result.countParams.s_id,
        "/",
        result.countParams.f_id
      );
      console.log("[HUG WM] 新規作成時の利用日数:", result.currentDays, "日");

    } catch (error) {
      console.error("[HUG WM] 利用日数取得エラー:", error);
    }
  })();
})();
