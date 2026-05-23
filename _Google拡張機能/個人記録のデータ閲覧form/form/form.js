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

  const renderPanelBody = (bodyEl) => {
    if (!bodyEl) return;

    bodyEl.innerHTML = `
      <section class="hug-form-section hug-form-section-attendance" style="${SECTION_ATTENDANCE_STYLE}">
        <div style="display:flex;align-items:center;gap:margin-bottom:6px;">
          <div style="${SECTION_TITLE_STYLE};">出席表・児童一覧</div>
          <div
            id="hug-form-attendance-wm-facilities"
            style="font-size:10px;word-break:break-all;"
          ></div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:0;align-items:flex-end;">
          <label style="flex:2;min-width:0;margin:0;">
            児童
            <select id="hug-form-child" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;"></select>
          </label>
          <label style="flex:1;min-width:0;margin:0;">
            出席表日付
            <input type="date" id="hug-form-attendance-date" title="入退室データ取得 POST の s_date" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;">
          </label>
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
          <button type="button" id="hug-form-fetch-month" style="flex:1;padding:6px 0;cursor:pointer;" title="過去分のみ（当日は除く）。今月1日〜昨日から最大6か月さかのぼって1件見つかるまで取得">過去の検索</button>
          <button type="button" id="hug-form-fetch" style="flex:1;padding:6px 0;cursor:pointer;">個人記録を取得</button>
        </div>
        <div id="hug-form-status" style="margin-top:8px;font-size:12px;color:#666;"></div>
        <label style="display:block;margin-top:10px;font-size:12px;color:#444;">
          活動内容（note）
          <span id="hug-form-note-meta" style="display:block;font-weight:normal;color:#888;margin:2px 0 4px;"></span>
          <textarea id="hug-form-note" readonly rows="12" spellcheck="false" placeholder="取得後に表示されます" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;padding:8px;font-size:12px;line-height:1.45;border:1px solid #ccc;border-radius:4px;resize:vertical;min-height:160px;background:#fff;"></textarea>
        </label>
      </section>
    `;
  };

  Form.renderPanelBody = renderPanelBody;

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

  const setNoteDisplay = (record) => {
    const noteEl = document.getElementById("hug-form-note");
    const metaEl = document.getElementById("hug-form-note-meta");
    if (!noteEl) return;

    if (!record) {
      noteEl.value = "";
      if (metaEl) metaEl.textContent = "";
      return;
    }

    noteEl.value = record.note ?? "";
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

    const childSelect = document.getElementById("hug-form-child");
    const attendanceDateInput = document.getElementById(
      "hug-form-attendance-date"
    );
    const facilitySelect = document.getElementById("hug-form-facility");
    const dateInput = document.getElementById("hug-form-date");
    const fetchMonthBtn = document.getElementById("hug-form-fetch-month");
    const fetchBtn = document.getElementById("hug-form-fetch");

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

    attendanceDateInput.addEventListener("change", () => {
      void loadChildren();
    });

    const loadChildren = async () => {
      updateAttendanceWmFacilityHint();

      window.HugPersonalRecord?.setFacilityFilterSingle?.(
        facilitySelect.value
      );

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

    const setFetchButtonsDisabled = (disabled) => {
      fetchBtn.disabled = disabled;
      fetchMonthBtn.disabled = disabled;
    };

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
      }
    });

    await loadChildren();

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
