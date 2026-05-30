// edit-post.js — 編集ページの取得内容に基づく下書き保存 POST（SaveHandler 相当の最小再現）

(() => {
  const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

  const resolveUrl = (pathOrUrl) => {
    const s = String(pathOrUrl || "").trim();
    if (!s) throw new Error("POST先が空です");
    try {
      return new URL(s).href;
    } catch {
      return new URL(s.replace(/^\.\//, ""), HUG_WM_BASE_URL).href;
    }
  };

  /** ContactBookSaveHook と同じ WAF 回避置換 */
  const applyContactBookWafTransforms = (text) => {
    let s = String(text ?? "");
    s = s.replace(/"/g, "カンマ");
    s = s.replace(/\u201d/g, "ゼカンマ");
    s = s.replace(/\(/g, "カッコマエ");
    s = s.replace(/\)/g, "カッコアト");
    s = s.replace(/（/g, "ゼカッコマエ");
    s = s.replace(/）/g, "ゼカッコアト");
    s = s.replace(/\bor\b/gi, "__OR__");
    s = s.replace(/\blike\b/gi, "__LIKE__");
    return s;
  };

  const appendFormControl = (formData, el) => {
    const n = el.name;
    if (!n || el.disabled) return;
    const tag = el.tagName.toLowerCase();
    if (tag === "fieldset") return;
    if (tag === "button") return;

    if (tag === "input") {
      const t = (el.type || "").toLowerCase();
      if (t === "file") {
        return;
      }
      if (t === "checkbox" || t === "radio") {
        if (el.checked) {
          formData.append(n, el.value);
        }
        return;
      }
      if (t === "image" || t === "reset") return;
      formData.append(n, el.value);
      return;
    }

    if (tag === "select") {
      if (el.multiple) {
        for (const o of el.selectedOptions) {
          formData.append(n, o.value);
        }
      } else {
        formData.append(n, el.value);
      }
      return;
    }

    if (tag === "textarea") {
      formData.append(n, el.value);
    }
  };

  /**
   * @param {Document} doc
   * @param {{ note?: string }} [fieldOverrides] note を指定すると編集HTMLの note を置き換え（下書きPOST用）
   */
  const buildContactBookDraftFormDataFromDocument = (doc, fieldOverrides = {}) => {
    const form = doc.querySelector("#form_id");
    if (!form) {
      throw new Error("#form_id が見つかりません");
    }

    const stateEl = form.querySelector('input[name="state"]');
    if (stateEl) {
      stateEl.value = "1";
    }

    const noteInput = form.querySelector('textarea[name="note"]');
    const noteHide = form.querySelector('textarea[name="note_hide"]');
    if (noteInput && noteHide) {
      if (fieldOverrides.note !== undefined) {
        noteInput.value = fieldOverrides.note;
      }
      noteHide.value = applyContactBookWafTransforms(noteInput.value);
      noteInput.disabled = true;
    }

    const staffInput = form.querySelector('textarea[name="staff_note"]');
    const staffHide = form.querySelector('textarea[name="staff_note_hide"]');
    if (staffInput && staffHide) {
      staffHide.value = applyContactBookWafTransforms(staffInput.value);
      staffInput.disabled = true;
    }

    const formData = new FormData();
    for (const el of form.elements) {
      appendFormControl(formData, el);
    }
    formData.append("is_ajax_request", "1");

    const action = form.getAttribute("action") || "contact_book.php";
    const postUrl = resolveUrl(action);

    return { formData, postUrl };
  };

  /**
   * @param {string} editHtml 編集ページの HTML 文字列（GET 済み）
   * @param {{ note?: string }} [fieldOverrides] 活動内容 note（エディタで編集した文字列を渡す）
   * @returns {Promise<{ ok: boolean, status: number, text: string, postUrl: string }>}
   */
  const postContactBookDraftFromEditHtml = async (
    editHtml,
    fieldOverrides = {}
  ) => {
    const doc = new DOMParser().parseFromString(editHtml, "text/html");
    const { formData, postUrl } = buildContactBookDraftFormDataFromDocument(
      doc,
      fieldOverrides
    );

    const res = await fetch(postUrl, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const text = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      text,
      postUrl
    };
  };

  window.HugContactBookPost = {
    applyContactBookWafTransforms,
    buildContactBookDraftFormDataFromDocument,
    postContactBookDraftFromEditHtml
  };
})();
