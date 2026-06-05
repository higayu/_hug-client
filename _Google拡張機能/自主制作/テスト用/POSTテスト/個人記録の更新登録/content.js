// 個人記録下書きPOSTテスト — パネルを差し込み

(() => {
  const start = () => {
    if (typeof window.HugContactBookDraftTest?.mount === "function") {
      window.HugContactBookDraftTest.mount();
    } else {
      console.error(
        "[HUG CB] HugContactBookDraftTest が未定義です。manifest の js 順を確認してください。"
      );
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
