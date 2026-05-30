// form.js — 下書き保存 POST テスト用フローティングパネル

(() => {
  const PANEL_ID = "hug-contact-book-draft-test-panel";

  /** 最後に取得した編集ページ HTML（下書きPOSTで使用） */
  let cachedEditHtml = "";

  const CONFIG = {
    /** テスト対象のサービス実施日（一覧・編集の照合） */
    calDate: "2026-05-09",
    c_id: 99,
    f_id: 3
  };

  const normalizeListDate = (text) => {
    const s = String(text || "")
      .trim()
      .replace(/\s+/g, "");
    const m = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!m) return "";
    const y = m[1];
    const mo = String(m[2]).padStart(2, "0");
    const d = String(m[3]).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  };

  const getNoteTextarea = (panel) =>
    panel.querySelector("textarea.hug-cb-note-draft");

  const ensurePanel = () => {
    if (document.getElementById(PANEL_ID)) {
      return /** @type {HTMLElement} */ (
        document.getElementById(PANEL_ID)
      );
    }

    if (!document.getElementById("hug-contact-book-draft-test-style")) {
      const st = document.createElement("style");
      st.id = "hug-contact-book-draft-test-style";
      st.textContent = `
        #${PANEL_ID} {
          position: fixed;
          left: 12px;
          bottom: 12px;
          z-index: 999998;
          width: 400px;
          background: #fff;
          border: 2px solid #1565c0;
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          font-size: 12px;
          color: #222;
        }
        #${PANEL_ID} .hdr {
          padding: 8px 10px;
          background: #1565c0;
          color: #fff;
          font-weight: bold;
          border-radius: 6px 6px 0 0;
        }
        #${PANEL_ID} .body {
          padding: 10px;
        }
        #${PANEL_ID} label.note-lbl {
          display: block;
          margin: 8px 0 4px;
          font-size: 11px;
          color: #444;
          font-weight: bold;
        }
        #${PANEL_ID} textarea.hug-cb-note-draft {
          width: 100%;
          min-height: 120px;
          box-sizing: border-box;
          padding: 8px;
          font-size: 13px;
          line-height: 1.4;
          border: 1px solid #90caf9;
          border-radius: 4px;
          resize: vertical;
        }
        #${PANEL_ID} .btn-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        #${PANEL_ID} button.fetch,
        #${PANEL_ID} button.post {
          width: 100%;
          padding: 8px;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          font-weight: bold;
        }
        #${PANEL_ID} button.fetch {
          border: 1px solid #0d47a1;
          background: #e3f2fd;
          color: #0d47a1;
        }
        #${PANEL_ID} button.post {
          border: 1px solid #2e7d32;
          background: #e8f5e9;
          color: #1b5e20;
        }
        #${PANEL_ID} button.fetch:disabled,
        #${PANEL_ID} button.post:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        #${PANEL_ID} .status {
          margin-top: 8px;
          padding: 6px;
          background: #f5f5f5;
          border-radius: 4px;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 200px;
          overflow: auto;
        }
        #${PANEL_ID} .meta {
          margin-bottom: 8px;
          font-size: 11px;
          color: #555;
        }
      `;
      document.head.appendChild(st);
    }

    const el = document.createElement("div");
    el.id = PANEL_ID;
    el.innerHTML = `
      <div class="hdr">個人記録・下書きPOSTテスト</div>
      <div class="body">
        <div class="meta">対象日: <strong>${CONFIG.calDate}</strong> / 児童 c_id=${CONFIG.c_id} / f_id=${CONFIG.f_id}</div>
        <label class="note-lbl" for="hug-cb-note-draft">活動内容（note）— 取得でサーバー値を表示。POST はこの内容を送信します。</label>
        <textarea id="hug-cb-note-draft" class="hug-cb-note-draft" spellcheck="false" placeholder="「一覧・編集を取得」で保存済みの note が入ります"></textarea>
        <div class="btn-row">
          <button type="button" class="fetch">一覧・編集を取得</button>
          <button type="button" class="post">下書きPOST（上のエリアの内容）</button>
        </div>
        <div class="status" aria-live="polite">待機中</div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  };

  const setStatus = (panel, message) => {
    const box = panel.querySelector(".status");
    if (box) {
      box.textContent = message;
    }
  };

  /**
   * 一覧 → 対象日行の編集パス → 編集 HTML 取得（POST しない）
   */
  const fetchListAndEditHtml = async () => {
    const fetchApi = window.HugContactBookFetch;
    if (!fetchApi?.fetchContactBookEditHtml) {
      throw new Error("HugContactBookFetch が読み込まれていません（editpage.js）");
    }

    const { calDate, c_id, f_id } = CONFIG;
    const listUrl = `${fetchApi.HUG_WM_BASE_URL}contact_book.php?f_id=${encodeURIComponent(f_id)}&date=${encodeURIComponent(calDate)}&date_end=${encodeURIComponent(calDate)}&id=${encodeURIComponent(c_id)}`;

    const listRes = await fetch(listUrl, {
      method: "GET",
      credentials: "include"
    });
    if (!listRes.ok) {
      throw new Error(`一覧 GET 失敗: ${listRes.status}`);
    }
    const listHtml = await listRes.text();
    const listDoc = new DOMParser().parseFromString(listHtml, "text/html");
    const table = listDoc.querySelector(
      'table.table.lh1_5[data-api-url="contact_book.php"][data-concurrent-edit-target="ContactBook"]'
    );
    if (!table) {
      throw new Error("一覧に対象テーブルが見つかりません");
    }

    const rows = [...table.querySelectorAll("tbody tr")];
    let editPath = "";
    let fallbackPath = "";

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      const dateNorm = normalizeListDate(cells[0]?.textContent);
      if (dateNorm !== calDate) {
        continue;
      }

      const editButton = cells[7]?.querySelector("button.edit");
      const onclick = editButton?.getAttribute("onclick") || "";
      const m = onclick.match(/location\.href='([^']+)'/);
      if (!m?.[1]) {
        continue;
      }

      const attendanceText = cells[4]?.textContent.trim().replace(/\s+/g, " ");
      if (attendanceText === "出席") {
        editPath = m[1];
        break;
      }
      if (!fallbackPath) {
        fallbackPath = m[1];
      }
    }

    if (!editPath) {
      editPath = fallbackPath;
    }

    if (!editPath) {
      throw new Error(
        `日付=${calDate} の行に編集ボタンがありません（一覧を確認）`
      );
    }

    const editHtml = await fetchApi.fetchContactBookEditHtml(editPath);
    return { listUrl, editPath, editHtml };
  };

  const runPostWithPanelNote = async (panel) => {
    const postApi = window.HugContactBookPost;
    if (!postApi?.postContactBookDraftFromEditHtml) {
      throw new Error("HugContactBookPost が読み込まれていません（edit-post.js）");
    }
    if (!cachedEditHtml) {
      throw new Error("先に「一覧・編集を取得」で編集ページを読み込んでください");
    }

    const ta = getNoteTextarea(panel);
    const note = ta ? ta.value : "";

    const result = await postApi.postContactBookDraftFromEditHtml(
      cachedEditHtml,
      { note }
    );

    let preview = result.text.slice(0, 800);
    if (result.text.length > 800) {
      preview += "\n…(truncated)";
    }

    try {
      const j = JSON.parse(result.text);
      preview = JSON.stringify(j, null, 2);
    } catch {
      /* 非JSONのまま */
    }

    return { result, preview };
  };

  const mount = () => {
    const panel = ensurePanel();
    const btnFetch = panel.querySelector("button.fetch");
    const btnPost = panel.querySelector("button.post");

    btnFetch?.addEventListener("click", async () => {
      btnFetch.disabled = true;
      btnPost.disabled = true;
      setStatus(panel, "取得中…");
      try {
        const { listUrl, editPath, editHtml } = await fetchListAndEditHtml();
        cachedEditHtml = editHtml;

        const noteFromServer =
          window.HugContactBookFetch?.extractNoteFromEditHtml?.(editHtml);
        const ta = getNoteTextarea(panel);
        if (ta) {
          ta.value = noteFromServer == null ? "" : noteFromServer;
        }

        const previewNote = (ta?.value ?? "").slice(0, 200);
        const noteTail = (ta?.value ?? "").length > 200 ? "…" : "";

        setStatus(
          panel,
          [
            "取得しました（下のエリアに note を表示）。内容を編集してから下書きPOSTできます。",
            "",
            `一覧: ${listUrl}`,
            `編集: ${editPath}`,
            "",
            `note 先頭: ${previewNote}${noteTail}`
          ].join("\n")
        );
      } catch (e) {
        console.error("[HUG CB]", e);
        cachedEditHtml = "";
        setStatus(panel, `エラー: ${e.message || e}`);
      } finally {
        btnFetch.disabled = false;
        btnPost.disabled = false;
      }
    });

    btnPost?.addEventListener("click", async () => {
      btnFetch.disabled = true;
      btnPost.disabled = true;
      setStatus(panel, "POST 送信中…");
      try {
        const { result, preview } = await runPostWithPanelNote(panel);
        setStatus(
          panel,
          [
            `POST: ${result.postUrl}`,
            `応答: ${result.status} ok=${result.ok}`,
            "",
            preview
          ].join("\n")
        );
      } catch (e) {
        console.error("[HUG CB]", e);
        setStatus(panel, `エラー: ${e.message || e}`);
      } finally {
        btnFetch.disabled = false;
        btnPost.disabled = false;
      }
    });
  };

  /**
   * 取得 → テキストエリア同期 → POST（コンソール・自動テスト用）
   */
  const runPipeline = async () => {
    const panel = document.getElementById(PANEL_ID) || ensurePanel();
    const { listUrl, editPath, editHtml } = await fetchListAndEditHtml();
    cachedEditHtml = editHtml;

    const noteFromServer =
      window.HugContactBookFetch?.extractNoteFromEditHtml?.(editHtml);
    const ta = getNoteTextarea(panel);
    if (ta) {
      ta.value = noteFromServer == null ? "" : noteFromServer;
    }

    const { result, preview } = await runPostWithPanelNote(panel);
    return { listUrl, editPath, result, preview };
  };

  window.HugContactBookDraftTest = {
    mount,
    runPipeline,
    fetchListAndEditHtml,
    runPostWithPanelNote,
    CONFIG,
    getCachedEditHtml: () => cachedEditHtml,
    clearCache: () => {
      cachedEditHtml = "";
    }
  };
})();
