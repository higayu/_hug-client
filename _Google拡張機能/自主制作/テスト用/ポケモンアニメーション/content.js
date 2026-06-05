(() => {
  if (document.getElementById("poke-fall-root")) return;

  /* ===== ルートコンテナ ===== */
  const root = document.createElement("div");
  root.id = "poke-fall-root";
  document.body.insertBefore(root, document.body.firstChild);

  function createPoke() {
    const poke = document.createElement("span");

    const size = Math.random() * (60 - 35) + 35; // 35〜60px
    const type = Math.floor(Math.random() * 5) + 1; // poke-1〜5
    const duration = Math.random() * 4 + 7; // 7〜11秒
    const rotate = Math.random() * 360;

    poke.className = `poke poke-${type}`;
    poke.style.width = `${size}px`;
    poke.style.height = `${size}px`;
    poke.style.left = `${Math.random() * 100}%`;
    poke.style.animationDuration = `${duration}s`;
    poke.style.transform = `rotate(${rotate}deg)`;

    root.appendChild(poke);

    setTimeout(() => {
      poke.remove();
    }, duration * 1000);
  }

  /* ===== poke生成開始 ===== */
  setInterval(createPoke, 400);
})();
