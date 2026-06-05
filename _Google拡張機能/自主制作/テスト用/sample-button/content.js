// ページが読み込まれたら実行
window.addEventListener("load", () => {

  // ボタンを作る
  const btn = document.createElement("button");
  btn.innerText = "出席完了！";
  btn.id = "myAttendanceBtn";

  // ボタンをクリックしたときの動作
  btn.addEventListener("click", () => {
    alert("出席ボタンが押されました！");
    // ここに必要な処理を追加できます
  });

  // ボタンを追加したい場所を選ぶ
  // 例: body の最後に追加
  document.body.appendChild(btn);
});
