(() => {
  const params = new URLSearchParams(window.location.search);
  const childId = params.get("select_child");
  if (!childId) return;

  const waitForElement = (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        }
        if (Date.now() - start > timeout) {
          clearInterval(timer);
          reject();
        }
      }, 100);
    });
  };

  window.addEventListener("load", async () => {
    console.log("did-finish-load 相当");

    try {
      // 🕒 DOM生成待ち
      const select = await waitForElement("#name_list");
      select.value = childId;
      select.dispatchEvent(new Event("change", { bubbles: true }));

      // 🕒 検索ボタン待ち
      setTimeout(async () => {
        const btn = document.querySelector("button.btn.btn-sm.search");
        if (!btn) throw new Error("search button not found");
        if (btn.disabled) throw new Error("search button is disabled");
        btn.click();
      }, 1500);

    } catch (e) {
      console.error("error:", e);
    }
  });
})();
