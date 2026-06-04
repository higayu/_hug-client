// edit-post.js — 編集ページ HTML に基づく個人記録の更新 POST（SaveHandler 相当）

(() => {
  const HUG_WM_BASE_URL = "https://www.hug-ayumu.link/hug/wm/";

  const resolveUrl = (pathOrUrl) => {
    const s = String(pathOrUrl || "").trim();
    if (!s) {
      throw new Error("POST先が空です");
    }
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
    if (!n || el.disabled) {
      return;
    }
    const tag = el.tagName.toLowerCase();
    if (tag === "fieldset" || tag === "button") {
      return;
    }

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
      if (t === "image" || t === "reset") {
        return;
      }
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
   * @param {{ note?: string, recordStaff?: string, state?: string }} [fieldOverrides]
   */
  const buildContactBookFormDataFromDocument = (doc, fieldOverrides = {}) => {
    const form = doc.querySelector("#form_id");
    if (!form) {
      throw new Error("#form_id が見つかりません");
    }

    const stateEl = form.querySelector('input[name="state"]');
    if (stateEl) {
      stateEl.value =
        fieldOverrides.state !== undefined
          ? String(fieldOverrides.state)
          : "1";
    }

    const recordStaffSelect = form.querySelector('select[name="record_staff"]');
    if (recordStaffSelect && fieldOverrides.recordStaff !== undefined) {
      recordStaffSelect.value = String(fieldOverrides.recordStaff);
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
   * @param {{ note?: string, recordStaff?: string, state?: string }} [fieldOverrides]
   * @returns {Promise<{ ok: boolean, status: number, text: string, postUrl: string }>}
   */
  const postContactBookUpdateFromEditHtml = async (
    editHtml,
    fieldOverrides = {}
  ) => {
    const doc = new DOMParser().parseFromString(editHtml, "text/html");
    const { formData, postUrl } = buildContactBookFormDataFromDocument(
      doc,
      fieldOverrides
    );

    console.log("[HUG WM] 個人記録 POST:", postUrl, fieldOverrides);

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
    buildContactBookFormDataFromDocument,
    postContactBookUpdateFromEditHtml,
    postContactBookDraftFromEditHtml: postContactBookUpdateFromEditHtml
  };
})();
