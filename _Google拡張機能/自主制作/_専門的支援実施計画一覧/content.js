(() => {
  window.addEventListener("load", () => {
    try {
      const table = document.querySelector("div.individualSituation table.table");
      if (!table) {
        console.warn("テーブル未存在");
        return;
      }

      // 「公開」を含む <i> を探す
      const openLabel = [...table.querySelectorAll("i")]
        .find(el => el.textContent.trim() === "公開");

      if (!openLabel) {
        console.warn("公開ラベル未存在");
        return;
      }

      // 親の <a> を取得
      const link = openLabel.closest("a");
      if (!link) {
        console.warn("公開リンク未存在");
        return;
      }

      console.log("公開ページへ遷移", link.href);

      // 🔽 遷移
      link.click();
      // または location.href = link.href;

    } catch (e) {
      console.error("error:", e);
    }
  });
})();
