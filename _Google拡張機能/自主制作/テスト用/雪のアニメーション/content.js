(() => {
  // すでに存在する場合は二重生成防止
  if (document.getElementById("snow-container")) return;

  /* ===== コンテナ作成 ===== */
  const container = document.createElement("div");
  container.id = "snow-container";
  document.body.appendChild(container);

  let snowId = 0;

  /* ===== 雪生成 ===== */
  function createSnow() {
    const snow = document.createElement("span");
    snow.className = "snow";

    const size = Math.random() * 6 + 4; // 4px〜10px
    const duration = Math.random() * 5 + 8; // 8〜13秒
    const left = Math.random() * window.innerWidth;

    snow.style.width = `${size}px`;
    snow.style.height = `${size}px`;
    snow.style.left = `${left}px`;
    snow.style.animationDuration = `${duration}s`;
    snow.dataset.id = snowId++;

    container.appendChild(snow);

    // アニメーション終了後に削除
    setTimeout(() => {
      snow.remove();
    }, duration * 1000);
  }

  /* ===== 定期生成 ===== */
  setInterval(createSnow, 120);
})();
