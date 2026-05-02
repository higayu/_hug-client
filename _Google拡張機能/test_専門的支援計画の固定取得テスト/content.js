(async () => {
  const url = "https://www.hug-ayumu.link/hug/wm/addition_plan_situation.php?mode=list&c_id=92";


try {
  console.log("[HUG WM] fetch開始:", url);

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  console.log("[HUG WM] status:", response.status);
  console.log("[HUG WM] ok:", response.ok);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const html = await response.text();

  console.log("[HUG WM] HTMLデータ:");
  console.log(html);

} catch (error) {
  console.error("[HUG WM] HTML取得エラー:", error);
}
})();