(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("hug_auto_personal") !== "1") return;
  if (!/contact_book\.php/i.test(window.location.pathname)) return;
  if (params.get("mode") === "edit") return;

  const autoKey = `hug_personal_record_auto:${window.location.search}`;
  if (sessionStorage.getItem(autoKey) === "done") return;

  const calDate = String(params.get("hug_cal_date") || "").trim();
  const childId = String(params.get("id") || "").trim();
  if (!childId) return;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitFor = (selector, timeout = 12000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
          return;
        }
        if (Date.now() - start > timeout) {
          reject(new Error(`timeout: ${selector}`));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });

  const clickFirstEditButton = () => {
    const table = document.querySelector("table.table.lh1_5");
    if (!table) return false;

    const rows = table.querySelectorAll("tbody tr");
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 8) continue;

      const editBtn = cells[7].querySelector("button.btn.btn-sm.m0.edit");
      if (editBtn) {
        editBtn.click();
        return true;
      }
    }
    return false;
  };

  const run = async () => {
    try {
      if (calDate) {
        const dp1 = await waitFor('input[name="date"]');
        const dp2 = await waitFor('input[name="date_end"]');
        dp1.value = calDate;
        dp2.value = calDate;
        dp1.dispatchEvent(new Event("input", { bubbles: true }));
        dp1.dispatchEvent(new Event("change", { bubbles: true }));
        dp2.dispatchEvent(new Event("input", { bubbles: true }));
        dp2.dispatchEvent(new Event("change", { bubbles: true }));

        const searchBtn = document.querySelector("button.btn.btn-sm.search");
        if (searchBtn) {
          await sleep(500);
          searchBtn.click();
          await waitFor("table.table.lh1_5 tbody tr", 15000);
          await sleep(400);
        }
      } else {
        await waitFor("table.table.lh1_5 tbody tr", 12000).catch(() => null);
      }

      if (clickFirstEditButton()) {
        sessionStorage.setItem(autoKey, "done");
      }
    } catch (e) {
      console.warn("[HUG WM] 個人記録タブ自動操作:", e);
    }
  };

  if (document.readyState === "loading") {
    window.addEventListener("load", () => void run(), { once: true });
  } else {
    void run();
  }
})();
