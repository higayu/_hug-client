window.addEventListener("load", () => {

  const btn = document.createElement("button");
  btn.id = "gifBtn";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("dancingcat2.gif");
  img.alt = "処理中";

  btn.appendChild(img);

  // 音声オブジェクトを作成
  const audio = new Audio(chrome.runtime.getURL("music/kouga1.mp3"));

  btn.addEventListener("click", () => {
    alert("GIFボタンが押されました");

    // 最初から再生したい場合
    audio.currentTime = 0;
    audio.play();
  });

  document.body.appendChild(btn);
});
