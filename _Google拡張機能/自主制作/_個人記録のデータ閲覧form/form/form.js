(() => {
  const HF = (window.HugPersonalForm = window.HugPersonalForm || {});
  const Form = (HF.Form = HF.Form || {});

  const FACILITIES = window.HugPersonalList?.FACILITIES ?? [
    { id: 3, name: "PD吉島" },
    { id: 6, name: "PD光" },
    { id: 7, name: "PD横川" },
    { id: 8, name: "PD五日市駅前" }
  ];

  const DEFAULT_FACILITY_ID = 3;

  /** 入退室フォームアプリ attendance-post-common.js と同じ */
  const ATTENDANCE_WM_FACILITY_STORAGE_KEY = "hugAttendanceFacilityFilter";
  const ATTENDANCE_WM_FACILITY_OPTIONS = [
    { id: 3, value: "PD吉島", defaultChecked: true },
    { id: 6, value: "PD光", defaultChecked: false },
    { id: 7, value: "PD横川", defaultChecked: false },
    { id: 8, value: "PD五日市駅前", defaultChecked: false }
  ];

  const readAttendanceWmFacilityFilter = () => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_WM_FACILITY_STORAGE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && typeof o === "object" ? o : null;
    } catch {
      return null;
    }
  };

  const isAttendanceWmFacilityChecked = (map, id, defaultChecked) => {
    const key = String(id);
    if (map && Object.prototype.hasOwnProperty.call(map, key)) {
      return Boolean(map[key]);
    }
    return Boolean(defaultChecked);
  };

  const formatAttendanceWmFacilitiesText = () => {
    const map = readAttendanceWmFacilityFilter();
    const checked = ATTENDANCE_WM_FACILITY_OPTIONS.filter((opt) =>
      isAttendanceWmFacilityChecked(map, opt.id, opt.defaultChecked)
    );

    if (!checked.length) {
      return "（未選択）";
    }

    return checked
      .map((opt) => `f_ary[${opt.id}]=${opt.value}`)
      .join(" · ");
  };

  const updateAttendanceWmFacilityHint = () => {
    const el = document.getElementById("hug-form-attendance-wm-facilities");
    if (!el) return;
    el.textContent = formatAttendanceWmFacilitiesText();
  };

  const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayDate = () => formatDateInput(new Date());

  const defaultPersonalRecordDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDateInput(d);
  };

  const SECTION_ATTENDANCE_STYLE = [
    "border:1px solid #90caf9",
    "background:#e8f4fc",
    "border-radius:6px",
    "padding:8px 10px",
    "margin-bottom:10px"
  ].join(";");

  const SECTION_PERSONAL_RECORD_STYLE = [
    "border:1px solid #ce93d8",
    "background:#f6edf8",
    "border-radius:6px",
    "padding:8px 10px",
    "margin-bottom:0"
  ].join(";");

  const SECTION_TITLE_STYLE =
    "font-size:11px;font-weight:bold;color:#555;margin:0 0 6px;letter-spacing:.02em;";

  const ATTENDANCE_SECTION_COLLAPSED_KEY =
    "hugPersonalFormAttendanceSectionCollapsed";

  const PUBLISH_SAVE_VISIBLE_KEY = "hugPersonalFormPublishSaveVisible";

  const NOTE_FONT_SIZE_STORAGE_KEY = "hugPersonalFormNoteFontSize";
  const DEFAULT_NOTE_FONT_SIZE = 12;
  const MIN_NOTE_FONT_SIZE = 10;
  const MAX_NOTE_FONT_SIZE = 24;

  const NOTE_FONT_BTN_STYLE = [
    "padding:0 6px",
    "cursor:pointer",
    "line-height:1.4",
    "border:1px solid #ccc",
    "border-radius:3px",
    "background:#fff",
    "font-size:12px",
    "min-width:24px"
  ].join(";");

  const clampNoteFontSize = (size) =>
    Math.min(
      MAX_NOTE_FONT_SIZE,
      Math.max(MIN_NOTE_FONT_SIZE, Math.round(Number(size)))
    );

  const loadNoteFontSize = () => {
    try {
      const raw = localStorage.getItem(NOTE_FONT_SIZE_STORAGE_KEY);
      if (!raw) return DEFAULT_NOTE_FONT_SIZE;
      const size = Number(raw);
      if (!Number.isFinite(size)) return DEFAULT_NOTE_FONT_SIZE;
      return clampNoteFontSize(size);
    } catch {
      return DEFAULT_NOTE_FONT_SIZE;
    }
  };

  const saveNoteFontSize = (size) => {
    try {
      localStorage.setItem(
        NOTE_FONT_SIZE_STORAGE_KEY,
        String(clampNoteFontSize(size))
      );
    } catch {
      /* ignore */
    }
  };

  const applyNoteFontSize = (size) => {
    const noteEl = document.getElementById("hug-form-note");
    const labelEl = document.getElementById("hug-form-note-font-size-label");
    const nextSize = clampNoteFontSize(size);
    if (noteEl) {
      noteEl.style.fontSize = `${nextSize}px`;
    }
    if (labelEl) {
      labelEl.textContent = `${nextSize}px`;
    }
    return nextSize;
  };

  const wireNoteFontSize = () => {
    const noteEl = document.getElementById("hug-form-note");
    const decBtn = document.getElementById("hug-form-note-font-dec");
    const incBtn = document.getElementById("hug-form-note-font-inc");
    if (!noteEl || !decBtn || !incBtn) return;

    let size = applyNoteFontSize(loadNoteFontSize());

    decBtn.addEventListener("click", () => {
      size = applyNoteFontSize(size - 1);
      saveNoteFontSize(size);
    });

    incBtn.addEventListener("click", () => {
      size = applyNoteFontSize(size + 1);
      saveNoteFontSize(size);
    });
  };

  const loadPublishSaveVisible = () => {
    try {
      return localStorage.getItem(PUBLISH_SAVE_VISIBLE_KEY) === "1";
    } catch {
      return false;
    }
  };

  const savePublishSaveVisible = (visible) => {
    try {
      localStorage.setItem(PUBLISH_SAVE_VISIBLE_KEY, visible ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const wirePublishSaveToggle = () => {
    const toggle = document.getElementById("hug-form-publish-toggle");
    const publishBtn = document.getElementById("hug-form-save-publish");
    if (!toggle || !publishBtn) return;

    const setVisible = (visible) => {
      publishBtn.hidden = !visible;
      toggle.textContent = visible ? "公開更新を隠す" : "公開更新を表示";
      toggle.setAttribute("aria-pressed", visible ? "true" : "false");
      toggle.title = visible
        ? "「公開で更新」ボタンを非表示にする"
        : "「公開で更新」ボタンを表示する";
      savePublishSaveVisible(visible);
      const panel = document.getElementById("hug-personal-record-form");
      window.HugPersonalForm?.Form?.fitPanelToViewport?.(panel);
    };

    setVisible(loadPublishSaveVisible());

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      setVisible(publishBtn.hidden);
    });
  };

  const wireAttendanceSectionCollapse = () => {
    const section = document.querySelector(
      ".hug-form-section-attendance"
    );
    const toggle = document.getElementById("hug-form-attendance-toggle");
    const body = document.getElementById("hug-form-attendance-body");
    if (!section || !toggle || !body) return;

    const setCollapsed = (collapsed) => {
      section.classList.toggle("hug-form-section-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.textContent = collapsed ? "開く" : "閉じる";
      try {
        localStorage.setItem(
          ATTENDANCE_SECTION_COLLAPSED_KEY,
          collapsed ? "1" : "0"
        );
      } catch {
        /* ignore */
      }
    };

    let initialCollapsed = false;
    try {
      initialCollapsed =
        localStorage.getItem(ATTENDANCE_SECTION_COLLAPSED_KEY) === "1";
    } catch {
      /* ignore */
    }
    setCollapsed(initialCollapsed);

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      setCollapsed(!section.classList.contains("hug-form-section-collapsed"));
      const panel = document.getElementById("hug-personal-record-form");
      window.HugPersonalForm?.Form?.fitPanelToViewport?.(panel);
    });
  };

  const renderPanelBody = (bodyEl) => {
    if (!bodyEl) return;

    bodyEl.innerHTML = `
    <section class="hug-form-section hug-form-section-attendance" style="${SECTION_ATTENDANCE_STYLE}">
      <div class="hug-form-section-header" style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <button
          type="button"
          id="hug-form-attendance-toggle"
          class="hug-form-section-toggle"
          aria-expanded="true"
          aria-controls="hug-form-attendance-body"
          title="出席表・児童一覧の表示を切り替え"
        >閉じる</button>

        <div style="flex:1;min-width:0;">
          <div style="${SECTION_TITLE_STYLE}margin-bottom:4px;">出席表・児童一覧</div>

          <div id="hug-form-attendance-body" class="hug-form-section-body">
            <div
              id="hug-form-attendance-wm-facilities"
              style="font-size:10px;word-break:break-all;margin-bottom:6px;"
            ></div>

            <div style="display:flex;gap:8px;margin-bottom:6px;align-items:flex-end;">
              <label style="flex:1;min-width:0;margin:0;">
                出席表日付
                <input
                  type="date"
                  id="hug-form-attendance-date"
                  title="入退室データ取得 POST の s_date"
                  style="display:block;width:100%;margin-top:2px;box-sizing:border-box;"
                >
              </label>
              <button
                type="button"
                id="hug-form-fetch-children"
                style="padding:6px 10px;cursor:pointer;white-space:nowrap;align-self:flex-end;"
                title="出席表 POST search_detail で児童一覧を再取得（リクエスト内容はコンソールに出力）"
              >児童を再取得</button>
            </div>
          </div>

          <label style="display:block;margin:0;">
            児童
            <select
              id="hug-form-child"
              style="display:block;width:100%;margin-top:2px;box-sizing:border-box;"
            ></select>
          </label>
        </div>
      </div>
    </section>

      <section class="hug-form-section hug-form-section-personal" style="${SECTION_PERSONAL_RECORD_STYLE}">
        <div style="${SECTION_TITLE_STYLE}">個人記録</div>
        <div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-end;">
          <label style="flex:1;min-width:0;margin:0;">
            施設
            <select id="hug-form-facility" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;"></select>
          </label>
          <label style="flex:1;min-width:0;margin:0;">
            個人記録日付
            <input type="date" id="hug-form-date" title="個人記録一覧・編集の取得日" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;">
          </label>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:0;">
          <button type="button" id="hug-form-fetch-month" style="flex:1;padding:6px 0;cursor:pointer;" title="過去分のみ（当日は除く）。今月1日〜昨日から最大6か月さかのぼって1件見つかるまで取得">過去の自動探索</button>
          <button type="button" id="hug-form-fetch" style="flex:1;padding:6px 0;cursor:pointer;">個人記録を取得</button>
        </div>
        <div id="hug-form-status" style="margin-top:8px;font-size:12px;color:#666;"></div>
        <label style="display:block;margin-top:10px;font-size:12px;color:#444;">
          <span style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px;">
            <span>活動内容（note）</span>
            <span style="display:flex;align-items:center;gap:4px;font-weight:normal;color:#666;font-size:11px;">
              <button
                type="button"
                id="hug-form-note-font-dec"
                title="文字を小さく"
                aria-label="活動内容の文字を小さく"
                style="${NOTE_FONT_BTN_STYLE}"
              >−</button>
              <span id="hug-form-note-font-size-label" aria-live="polite">${DEFAULT_NOTE_FONT_SIZE}px</span>
              <button
                type="button"
                id="hug-form-note-font-inc"
                title="文字を大きく"
                aria-label="活動内容の文字を大きく"
                style="${NOTE_FONT_BTN_STYLE}"
              >＋</button>
            </span>
          </span>
          <span id="hug-form-note-meta" style="display:block;font-weight:normal;color:#888;margin:2px 0 4px;"></span>
          <label style="display:block;margin:0 0 8px;font-weight:normal;color:#444;">
            記録者
            <select
              id="hug-form-record-staff"
              name="record_staff"
              style="display:block;width:100%;margin-top:2px;box-sizing:border-box;padding:4px;border:1px solid #ccc;border-radius:4px;background:#fff;"
            >
              <option value="">取得後に表示されます</option>
            </select>
          </label>
          <textarea id="hug-form-note" rows="12" spellcheck="false" placeholder="取得後に表示されます。編集して更新できます。" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;padding:8px;line-height:1.45;border:1px solid #ccc;border-radius:4px;resize:vertical;min-height:160px;background:#fff;"></textarea>
        </label>
        <div style="margin-top:10px;">
          <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
            <button
              type="button"
              id="hug-form-publish-toggle"
              class="hug-form-section-toggle"
              aria-pressed="false"
              title="「公開で更新」ボタンを表示する"
            >公開更新を表示</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button
              type="button"
              id="hug-form-save-draft"
              disabled
              style="flex:1;padding:8px 0;cursor:pointer;border:1px solid #2e7d32;background:#e8f5e9;color:#1b5e20;border-radius:4px;font-weight:bold;"
              title="取得済み編集ページをベースに note・記録者を下書き保存（state=1）"
            >下書きで更新</button>
            <button
              type="button"
              id="hug-form-save-publish"
              disabled
              hidden
              style="flex:1;padding:8px 0;cursor:pointer;border:1px solid #1565c0;background:#e3f2fd;color:#0d47a1;border-radius:4px;font-weight:bold;"
              title="取得済み編集ページをベースに note・記録者を保護者公開保存（state=2）"
            >公開で更新</button>
          </div>
        </div>
      </section>
    `;
  };

  Form.renderPanelBody = renderPanelBody;

  /** 最後に取得した編集ページ HTML（更新 POST で使用） */
  let cachedRecord = null;

  const getCachedRecord = () => cachedRecord;

  const clearCachedRecord = () => {
    cachedRecord = null;
    updateSaveButtonsState();
  };

  const setCachedRecord = (record) => {
    cachedRecord = record?.editHtml ? record : null;
    updateSaveButtonsState();
  };

  const updateSaveButtonsState = () => {
    const hasCache = Boolean(cachedRecord?.editHtml);
    const saveDraftBtn = document.getElementById("hug-form-save-draft");
    const savePublishBtn = document.getElementById("hug-form-save-publish");
    if (saveDraftBtn) {
      saveDraftBtn.disabled = !hasCache;
    }
    if (savePublishBtn) {
      savePublishBtn.disabled = !hasCache;
    }
  };

  const readFormFieldOverrides = () => {
    const noteEl = document.getElementById("hug-form-note");
    const recordStaffEl = document.getElementById("hug-form-record-staff");
    const overrides = {
      note: noteEl ? noteEl.value : ""
    };
    if (recordStaffEl?.value) {
      overrides.recordStaff = recordStaffEl.value;
    }
    return overrides;
  };

  const formatPostResponsePreview = (text) => {
    let preview = String(text ?? "").slice(0, 800);
    if (text.length > 800) {
      preview += "\n…(truncated)";
    }
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return preview;
    }
  };

  const postCachedRecordUpdate = async (state) => {
    const postApi = window.HugContactBookPost;
    if (!postApi?.postContactBookUpdateFromEditHtml) {
      throw new Error("edit-post.js が読み込まれていません");
    }
    if (!cachedRecord?.editHtml) {
      throw new Error("先に個人記録を取得してください");
    }

    const fieldOverrides = {
      ...readFormFieldOverrides(),
      state: String(state)
    };

    const result = await postApi.postContactBookUpdateFromEditHtml(
      cachedRecord.editHtml,
      fieldOverrides
    );

    let parsed = null;
    try {
      parsed = JSON.parse(result.text);
    } catch {
      /* non-JSON */
    }

    if (parsed?.status === "conflict") {
      throw new Error(
        "同時編集の競合が発生しました。個人記録を再取得してから更新してください。"
      );
    }

    if (!result.ok) {
      throw new Error(`POST 失敗: HTTP ${result.status}`);
    }

    if (parsed && parsed.status && parsed.status !== "ok") {
      throw new Error(`保存失敗: status=${parsed.status}`);
    }

    return {
      result,
      preview: formatPostResponsePreview(result.text)
    };
  };

  Form.getCachedRecord = getCachedRecord;
  Form.clearCachedRecord = clearCachedRecord;
  Form.postCachedRecordUpdate = postCachedRecordUpdate;

  const fillSelect = (select, options, getValue, getLabel) => {
    select.innerHTML = "";
    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = getValue(opt);
      el.textContent = getLabel(opt);
      select.appendChild(el);
    });
  };

  const setStatus = (text, isError = false) => {
    const el = document.getElementById("hug-form-status");
    if (el) {
      el.textContent = text;
      el.style.color = isError ? "#c00" : "#666";
    }
    const headerStatus = document.getElementById("hug-pr-header-status");
    if (headerStatus) {
      headerStatus.textContent = text;
      headerStatus.style.color = isError ? "#ffcdd2" : "";
    }
  };

  const setRecordStaffDisplay = (recordStaff) => {
    const selectEl = document.getElementById("hug-form-record-staff");
    if (!selectEl) return;

    selectEl.innerHTML = "";

    if (!recordStaff?.options?.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = recordStaff ? "（記録者なし）" : "取得後に表示されます";
      selectEl.appendChild(option);
      return;
    }

    recordStaff.options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.text;
      option.selected = Boolean(item.selected);
      selectEl.appendChild(option);
    });

    if (recordStaff.value) {
      selectEl.value = recordStaff.value;
    }
  };

  const setNoteDisplay = (record) => {
    const noteEl = document.getElementById("hug-form-note");
    const metaEl = document.getElementById("hug-form-note-meta");
    if (!noteEl) return;

    if (!record) {
      noteEl.value = "";
      if (metaEl) metaEl.textContent = "";
      setRecordStaffDisplay(null);
      clearCachedRecord();
      return;
    }

    noteEl.value = record.note ?? "";
    setRecordStaffDisplay(record.recordStaff ?? null);
    setCachedRecord(record);
    if (metaEl) {
      const parts = [record.date, record.childName, record.attendance].filter(
        Boolean
      );
      metaEl.textContent = parts.join(" / ");
    }
  };

  const initPanelContent = async () => {
    const panel = document.getElementById("hug-personal-record-form");
    if (panel?.dataset.hugContentWired === "1") {
      return;
    }

    const bodyEl = document.getElementById("hug-pr-panel-body");
    if (!bodyEl) {
      return;
    }

    renderPanelBody(bodyEl);
    wireAttendanceSectionCollapse();
    wirePublishSaveToggle();
    wireNoteFontSize();

    const childSelect = document.getElementById("hug-form-child");
    const attendanceDateInput = document.getElementById(
      "hug-form-attendance-date"
    );
    const facilitySelect = document.getElementById("hug-form-facility");
    const dateInput = document.getElementById("hug-form-date");
    const fetchMonthBtn = document.getElementById("hug-form-fetch-month");
    const fetchBtn = document.getElementById("hug-form-fetch");
    const fetchChildrenBtn = document.getElementById("hug-form-fetch-children");
    const saveDraftBtn = document.getElementById("hug-form-save-draft");
    const savePublishBtn = document.getElementById("hug-form-save-publish");

    attendanceDateInput.value = todayDate();
    dateInput.value = defaultPersonalRecordDate();

    updateAttendanceWmFacilityHint();
    window.addEventListener("storage", (event) => {
      if (event.key === ATTENDANCE_WM_FACILITY_STORAGE_KEY) {
        updateAttendanceWmFacilityHint();
      }
    });
    window.addEventListener("focus", updateAttendanceWmFacilityHint);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        updateAttendanceWmFacilityHint();
      }
    });

    fillSelect(
      facilitySelect,
      FACILITIES,
      (f) => String(f.id),
      (f) => f.name
    );
    const savedFacilityId =
      window.HugPersonalRecord?.getPrimaryFacilityId?.() ??
      String(DEFAULT_FACILITY_ID);
    facilitySelect.value = FACILITIES.some(
      (f) => String(f.id) === savedFacilityId
    )
      ? savedFacilityId
      : String(DEFAULT_FACILITY_ID);

    facilitySelect.addEventListener("change", () => {
      window.HugPersonalRecord?.setFacilityFilterSingle?.(
        facilitySelect.value
      );
      void loadChildren();
    });

    const loadChildren = async ({ refreshFacilityFromWm = false } = {}) => {
      if (refreshFacilityFromWm) {
        window.HugPersonalRecord?.refreshFacilityFilterFromWmCache?.();
        updateAttendanceWmFacilityHint();

        const primaryId =
          window.HugPersonalRecord?.getPrimaryFacilityId?.() ??
          String(DEFAULT_FACILITY_ID);
        if (
          FACILITIES.some((f) => String(f.id) === primaryId)
        ) {
          facilitySelect.value = primaryId;
        }
      } else {
        updateAttendanceWmFacilityHint();
        window.HugPersonalRecord?.setFacilityFilterSingle?.(
          facilitySelect.value
        );
      }

      const fetchList =
        window.HugPersonalRecord?.fetchAttendanceChildrenList ||
        window.HugAttendance?.fetchAttendanceData;

      if (!fetchList) {
        setStatus("児童一覧取得機能がありません（content.js）");
        return;
      }

      try {
        setStatus("児童一覧を読み込み中…（POST search_detail）");
        const list = await fetchList();

        if (!list.length) {
          setStatus("児童が見つかりませんでした");
          return;
        }

        fillSelect(
          childSelect,
          list,
          (c) => c.c_id,
          (c) => (c.name ? `${c.name} (${c.c_id})` : `ID ${c.c_id}`)
        );

        setStatus(`児童 ${list.length} 名`);
      } catch (err) {
        console.error("[HUG WM] 児童一覧取得エラー:", err);
        setStatus(`児童一覧エラー: ${err.message}`, true);
      }
    };

    attendanceDateInput.addEventListener("change", () => {
      void loadChildren();
    });

    fetchChildrenBtn?.addEventListener("click", () => {
      void loadChildren({ refreshFacilityFromWm: true });
    });

    const setFetchButtonsDisabled = (disabled) => {
      fetchBtn.disabled = disabled;
      fetchMonthBtn.disabled = disabled;
    };

    const setSaveButtonsDisabled = (disabled) => {
      if (saveDraftBtn) {
        saveDraftBtn.disabled = disabled || !cachedRecord?.editHtml;
      }
      if (savePublishBtn) {
        savePublishBtn.disabled = disabled || !cachedRecord?.editHtml;
      }
    };

    const runSave = async (state, label) => {
      setSaveButtonsDisabled(true);
      setFetchButtonsDisabled(true);
      setStatus(`${label}を送信中…`);
      try {
        const { result, preview } = await postCachedRecordUpdate(state);
        console.log(`[HUG WM] ${label} 完了:`, result, preview);
        setStatus(`${label}完了（HTTP ${result.status}）`);
      } catch (err) {
        console.error(`[HUG WM] ${label}エラー:`, err);
        setStatus(`${label}エラー: ${err.message}`, true);
      } finally {
        setFetchButtonsDisabled(false);
        updateSaveButtonsState();
      }
    };

    saveDraftBtn?.addEventListener("click", () => {
      void runSave("1", "下書き更新");
    });

    savePublishBtn?.addEventListener("click", () => {
      if (
        !window.confirm(
          "保護者公開（state=2）で更新します。よろしいですか？"
        )
      ) {
        return;
      }
      void runSave("2", "公開更新");
    });

    const readPersonalFetchContext = () => {
      const childId = childSelect.value;
      const facilityId = Number(facilitySelect.value);
      if (!childId) {
        setStatus("児童を選択してください", true);
        return null;
      }
      return { childId, facilityId };
    };

    const applyFetchedRecord = (record, records, statusSuffix = "") => {
      console.log("[HUG WM] 取得完了:", record);
      console.table(records);

      const dateNorm =
        record?.dateNorm ||
        window.HugPersonalList?.normalizeListDate?.(record?.date);
      if (dateNorm && dateInput) {
        dateInput.value = dateNorm;
      }

      setNoteDisplay(record);
      const suffix = statusSuffix ? ` ${statusSuffix}` : "";
      setStatus(
        record?.note
          ? `取得完了（${record.note.length} 文字）${suffix}`
          : `取得完了: ${records.length} 件（note なし）${suffix}`
      );
    };

    fetchMonthBtn.addEventListener("click", async () => {
      const ctx = readPersonalFetchContext();
      if (!ctx) {
        return;
      }

      const fetchUntilFound =
        window.HugPersonalForm?.MonthFetch?.fetchPersonalRecordsUntilFound;
      if (!fetchUntilFound) {
        setStatus(
          "personal-record-month-fetch.js が読み込まれていません",
          true
        );
        return;
      }

      setFetchButtonsDisabled(true);
      setSaveButtonsDisabled(true);
      setStatus("月ごとに個人記録を検索中…（今月から最大6か月）");
      setNoteDisplay(null);

      try {
        const result = await fetchUntilFound({
          facilityId: ctx.facilityId,
          childId: ctx.childId,
          withNotes: true,
          onMonthAttempt: ({ phase, dateStart, dateEnd }) => {
            if (phase === "list") {
              setStatus(`${dateStart}〜${dateEnd} を一覧取得中…`);
              return;
            }
            if (phase === "empty") {
              setStatus(`${dateStart}〜${dateEnd} に該当なし。前月へ…`);
              return;
            }
            if (phase === "note") {
              setStatus(`${dateStart}〜${dateEnd} の note を取得中…`);
            }
          }
        });

        const { record, records, monthWindow } = result;
        const rangeLabel = `${monthWindow.dateStart}〜${monthWindow.dateEnd}`;
        applyFetchedRecord(record, records, `（${rangeLabel}）`);
      } catch (err) {
        console.error("[HUG WM] 月ごと個人記録取得エラー:", err);
        setNoteDisplay(null);
        setStatus(`取得エラー: ${err.message}`, true);
      } finally {
        setFetchButtonsDisabled(false);
        updateSaveButtonsState();
      }
    });

    fetchBtn.addEventListener("click", async () => {
      const ctx = readPersonalFetchContext();
      if (!ctx) {
        return;
      }
      const date = dateInput.value;
      const dateEnd = date;

      if (!date) {
        setStatus("日付を入力してください", true);
        return;
      }
      if (!window.HugPersonalList?.fetchPersonalRecords) {
        setStatus("personallist.js が読み込まれていません", true);
        return;
      }

      setFetchButtonsDisabled(true);
      setSaveButtonsDisabled(true);
      setStatus("個人記録を取得中…");
      setNoteDisplay(null);

      try {
        const records = await window.HugPersonalList.fetchPersonalRecords({
          facilityId: ctx.facilityId,
          date,
          dateEnd,
          childId: ctx.childId,
          withNotes: true
        });

        const record = records[0] ?? null;
        applyFetchedRecord(record, records);
      } catch (err) {
        console.error("[HUG WM] 個人記録取得エラー:", err);
        setNoteDisplay(null);
        setStatus(`取得エラー: ${err.message}`, true);
      } finally {
        setFetchButtonsDisabled(false);
        updateSaveButtonsState();
      }
    });

    await loadChildren();

    window.HugPersonalForm?.Form?.fitPanelToViewport?.(panel);

    if (panel) {
      panel.dataset.hugContentWired = "1";
    }
  };

  Form.initPanelContent = initPanelContent;

  const initForm = async () => {
    if (typeof Form.createPanelIfNeeded !== "function") {
      console.error(
        "[HUG PR] createPanelIfNeeded がありません。form-panel.js を読み込んでください。"
      );
      return;
    }

    Form.createPanelIfNeeded();
    await initPanelContent();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initForm);
  } else {
    initForm();
  }
})();
