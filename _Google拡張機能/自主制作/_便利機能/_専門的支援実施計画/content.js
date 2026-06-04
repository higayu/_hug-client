(() => {
  window.addEventListener("load", () => {
    try {
      const table = document.querySelector("div.carePlanContent table");
      if (!table) return;

      table.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (e) {
      console.error("error:", e);
    }
  });
})();
