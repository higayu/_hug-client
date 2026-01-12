(() => {
  // ===============================
  // URLパラメータ取得
  // ===============================
  const params = new URLSearchParams(window.location.search);
  const SELECT_CHILD = params.get("select_child");

  // パラメータが無ければ何もしない
  if (!SELECT_CHILD) return;

  // ===============================
  // 要素が出るまで待つ関数
  // ===============================
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

  // ===============================
  // ① 既存の自動入力処理
  // ===============================
  (async () => {
    try {
      const support = await waitForElement('select[name="adding_children_id"]');
      support.value = "55";
      support.dispatchEvent(new Event("change", { bubbles: true }));

      const child = await waitForElement('select[name="c_id_list[0][id]"]');
      child.value = SELECT_CHILD;
      child.dispatchEvent(new Event("change", { bubbles: true }));

      console.log("自動入力完了:", SELECT_CHILD);
    } catch {
      console.warn("要素取得に失敗しました");
    }
  })();
})();
