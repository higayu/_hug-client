(() => {
  const FACILITIES = window.HugPersonalList?.FACILITIES ?? [
    { id: 3, name: "PD吉島" },
    { id: 6, name: "PD光" },
    { id: 7, name: "PD横川" },
    { id: 8, name: "PD五日市駅前" }
  ];

  const DEFAULT_FACILITY_ID = 3;

  const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const createPanel = () => {
    const panel = document.createElement("div");
    panel.id = "hug-personal-record-form";
    panel.style.cssText = [
      "position:fixed",
      "top:12px",
      "right:12px",
      "z-index:99999",
      "background:#fff",
      "border:1px solid #ccc",
      "border-radius:8px",
      "padding:12px 14px",
      "box-shadow:0 2px 8px rgba(0,0,0,.15)",
      "font:14px/1.4 sans-serif",
      "min-width:280px"
    ].join(";");

    panel.innerHTML = `
      <div style="font-weight:bold;margin-bottom:8px;">個人記録の取得</div>
      <label style="display:block;margin-bottom:6px;">
        児童
        <select id="hug-form-child" style="display:block;width:100%;margin-top:2px;"></select>
      </label>
      <label style="display:block;margin-bottom:6px;">
        施設
        <select id="hug-form-facility" style="display:block;width:100%;margin-top:2px;"></select>
      </label>
      <label style="display:block;margin-bottom:6px;">
        日付（開始）
        <input type="date" id="hug-form-date" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;">
      </label>
      <label style="display:block;margin-bottom:8px;">
        日付（終了）
        <input type="date" id="hug-form-date-end" style="display:block;width:100%;margin-top:2px;box-sizing:border-box;">
      </label>
      <button type="button" id="hug-form-fetch" style="width:100%;padding:6px 0;cursor:pointer;">個人記録を取得</button>
      <div id="hug-form-status" style="margin-top:8px;font-size:12px;color:#666;"></div>
    `;

    document.body.appendChild(panel);
    return panel;
  };

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
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#c00" : "#666";
  };

  const initForm = async () => {
    if (document.getElementById("hug-personal-record-form")) {
      return;
    }

    createPanel();

    const childSelect = document.getElementById("hug-form-child");
    const facilitySelect = document.getElementById("hug-form-facility");
    const dateInput = document.getElementById("hug-form-date");
    const dateEndInput = document.getElementById("hug-form-date-end");
    const fetchBtn = document.getElementById("hug-form-fetch");

    const today = formatDateInput(new Date());
    dateInput.value = today;
    dateEndInput.value = today;

    fillSelect(
      facilitySelect,
      FACILITIES,
      (f) => String(f.id),
      (f) => f.name
    );
    facilitySelect.value = String(DEFAULT_FACILITY_ID);

    const loadChildren = async () => {
      if (!window.HugAttendance?.fetchAttendanceData) {
        setStatus("入退室データ未取得（児童一覧なし）");
        return;
      }

      try {
        setStatus("児童一覧を読み込み中…");
        const list = await window.HugAttendance.fetchAttendanceData();

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

    fetchBtn.addEventListener("click", async () => {
      const childId = childSelect.value;
      const childOption = childSelect.selectedOptions[0];
      const childLabel = childOption?.textContent ?? "";
      const childName = childLabel.replace(/\s*\(\d+\)\s*$/, "").trim();

      const facilityId = Number(facilitySelect.value);
      const date = dateInput.value;
      const dateEnd = dateEndInput.value || date;

      if (!childId) {
        setStatus("児童を選択してください", true);
        return;
      }
      if (!date) {
        setStatus("日付を入力してください", true);
        return;
      }
      if (!window.HugPersonalList?.fetchPersonalRecords) {
        setStatus("personallist.js が読み込まれていません", true);
        return;
      }

      fetchBtn.disabled = true;
      setStatus("個人記録を取得中…");

      try {
        const records = await window.HugPersonalList.fetchPersonalRecords({
          facilityId,
          date,
          dateEnd,
          childId,
          childName,
          withNotes: true
        });

        console.log("[HUG WM] 個人記録一覧:", records);
        console.table(records);

        setStatus(`取得完了: ${records.length} 件`);
      } catch (err) {
        console.error("[HUG WM] 個人記録取得エラー:", err);
        setStatus(`取得エラー: ${err.message}`, true);
      } finally {
        fetchBtn.disabled = false;
      }
    });

    await loadChildren();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initForm);
  } else {
    initForm();
  }
})();
