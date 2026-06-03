(() => {
  if (document.getElementById("leaf-fall-root")) return;

  // body直下に最外層コンテナを作成
  const root = document.createElement("div");
  root.id = "leaf-fall-root";

  // bodyの一番外側に入れる
  document.body.insertBefore(root, document.body.firstChild);

  let leafId = 0;

  function createLeaf() {
    const leaf = document.createElement("span");
    const size = Math.random() * (50 - 30) + 30;
    const type = Math.floor(Math.random() * 3) + 1;

    leaf.className = `leaf leaf-${type}`;
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.animationDuration = "8s";

    root.appendChild(leaf);

    setTimeout(() => {
      leaf.remove();
    }, 8000);
  }

  // 落ち葉生成開始
  setInterval(createLeaf, 350);
})();
